import { logger } from "./logger";

export type JobPriority = "premium" | "standard";

interface QueueItem {
  jobId: number;
  priority: JobPriority;
  addedAt: Date;
}

type ProgressCallback = (pct: number) => void;
type JobProcessor = (jobId: number, onProgress: ProgressCallback) => Promise<void>;

/**
 * Priority render queue with configurable concurrency.
 * Premium jobs are always processed before standard jobs.
 * Maintains rolling average render durations per tier for ETA calculation.
 */
class RenderQueue {
  readonly concurrency: number;
  private active: Set<number> = new Set();
  private queue: QueueItem[] = [];
  private processor: JobProcessor | null = null;

  /** Rolling average render duration in seconds, per tier */
  private avgDurationSecs: Record<JobPriority, number> = {
    premium: 180,
    standard: 120,
  };

  constructor() {
    this.concurrency = parseInt(process.env.RENDER_CONCURRENCY ?? "2", 10);
    logger.info(`[RenderQueue] Initialized with concurrency=${this.concurrency}`);
  }

  setProcessor(fn: JobProcessor): void {
    this.processor = fn;
  }

  enqueue(jobId: number, priority: JobPriority = "standard"): void {
    if (this.active.has(jobId)) return;
    if (this.queue.find(i => i.jobId === jobId)) return;
    this.queue.push({ jobId, priority, addedAt: new Date() });
    this._sortQueue();
    logger.info(`[RenderQueue] Enqueued job ${jobId} (${priority}). Queue: ${this.queue.length}, Active: ${this.active.size}`);
    this._pump();
  }

  private _sortQueue(): void {
    this.queue.sort((a, b) => {
      if (a.priority === "premium" && b.priority !== "premium") return -1;
      if (a.priority !== "premium" && b.priority === "premium") return 1;
      return a.addedAt.getTime() - b.addedAt.getTime();
    });
  }

  private _pump(): void {
    if (!this.processor) {
      logger.warn("[RenderQueue] No processor set — cannot pump queue");
      return;
    }
    while (this.active.size < this.concurrency && this.queue.length > 0) {
      const item = this.queue.shift()!;
      this.active.add(item.jobId);
      const startMs = Date.now();

      logger.info(`[RenderQueue] Starting job ${item.jobId} (${item.priority}). Active: ${this.active.size}/${this.concurrency}`);

      this.processor(item.jobId, (_pct) => {
        // Progress callback — videoRenderer writes to DB directly
      }).then(() => {
        const durSecs = (Date.now() - startMs) / 1000;
        // Update rolling average (exponential smoothing)
        this.avgDurationSecs[item.priority] =
          this.avgDurationSecs[item.priority] * 0.7 + durSecs * 0.3;
        logger.info(`[RenderQueue] Job ${item.jobId} done in ${durSecs.toFixed(1)}s. Avg ${item.priority}: ${this.avgDurationSecs[item.priority].toFixed(0)}s`);
      }).catch((err: Error) => {
        logger.error({ err }, `[RenderQueue] Job ${item.jobId} threw in queue processor`);
      }).finally(() => {
        this.active.delete(item.jobId);
        this._pump();
      });
    }
  }

  /** 1-based position in the waiting queue, or null if active/not found */
  getQueuePosition(jobId: number): number | null {
    const idx = this.queue.findIndex(i => i.jobId === jobId);
    return idx >= 0 ? idx + 1 : null;
  }

  /** Estimated wall-clock completion time for a queued or active job */
  getEta(jobId: number, priority: JobPriority): Date | null {
    const avgDur = this.avgDurationSecs[priority];

    if (this.active.has(jobId)) {
      // Already rendering — estimate remaining time as half the avg
      return new Date(Date.now() + (avgDur * 0.5) * 1000);
    }

    const position = this.getQueuePosition(jobId);
    if (position === null) return null;

    // How many full "batches" until this job starts?
    const availableSlots = this.concurrency - this.active.size;
    const batchesBeforeStart = Math.max(0, Math.ceil((position - availableSlots) / this.concurrency));
    const waitSecs = batchesBeforeStart * avgDur + avgDur;
    return new Date(Date.now() + waitSecs * 1000);
  }

  isActive(jobId: number): boolean {
    return this.active.has(jobId);
  }

  getStats() {
    return {
      concurrency: this.concurrency,
      activeJobs: Array.from(this.active),
      activeCount: this.active.size,
      queuedCount: this.queue.length,
      queue: this.queue.map((item, idx) => ({
        jobId: item.jobId,
        priority: item.priority,
        position: idx + 1,
        addedAt: item.addedAt.toISOString(),
        etaMs: this.getEta(item.jobId, item.priority)?.getTime() ?? null,
      })),
      avgDurationSecs: { ...this.avgDurationSecs },
    };
  }
}

export const renderQueue = new RenderQueue();
