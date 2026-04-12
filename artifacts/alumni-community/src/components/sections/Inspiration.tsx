import { Sparkles } from "lucide-react";

export default function Inspiration() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border border-primary/20 bg-[radial-gradient(circle_at_50%_0%,rgba(245,192,55,0.18),transparent_38%),linear-gradient(135deg,rgba(0,19,164,0.24),rgba(255,255,255,0.035))] p-8 text-center shadow-[0_0_90px_rgba(245,192,55,0.12)] md:p-14">
        <Sparkles className="mx-auto h-8 w-8 text-primary" />
        <p className="mx-auto mt-7 max-w-3xl font-serif text-3xl font-bold leading-relaxed text-white md:text-5xl">
          “הבוגר אינו עוזב את הבית; הוא יוצא ממנו כדי להאיר במקום שבו הוא נמצא.”
        </p>

      </div>
    </section>
  );
}