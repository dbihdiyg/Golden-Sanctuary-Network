import { useEffect, useRef, useCallback, useState } from "react";
import * as THREE from "three";
import { loadAnyFont } from "@/lib/fonts";

export type Material3DType =
  | "gold"
  | "chrome"
  | "silver"
  | "rose-gold"
  | "copper"
  | "platinum"
  | "matte"
  | "glass"
  | "obsidian";

export const MATERIAL_3D_OPTIONS: { id: Material3DType; name: string; color: string }[] = [
  { id: "gold",      name: "זהב",       color: "#D4AF37" },
  { id: "chrome",    name: "כרום",      color: "#dde8f0" },
  { id: "silver",    name: "כסף",       color: "#C0C0C0" },
  { id: "rose-gold", name: "רוז גולד",  color: "#c48b9f" },
  { id: "copper",    name: "נחושת",     color: "#b87333" },
  { id: "platinum",  name: "פלטינה",   color: "#E5E4E2" },
  { id: "matte",     name: "מט",        color: "#2a2a2a" },
  { id: "glass",     name: "זכוכית",    color: "#88aacc" },
  { id: "obsidian",  name: "אובסידיאן", color: "#1a1a22" },
];

function buildSideMaterial(preset: Material3DType): THREE.Material {
  switch (preset) {
    case "gold":
      return new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 1.0, roughness: 0.12 });
    case "chrome":
      return new THREE.MeshStandardMaterial({ color: 0xdde8f8, metalness: 1.0, roughness: 0.04 });
    case "silver":
      return new THREE.MeshStandardMaterial({ color: 0xC0C0C0, metalness: 0.9, roughness: 0.26 });
    case "rose-gold":
      return new THREE.MeshStandardMaterial({ color: 0xc48b9f, metalness: 0.9, roughness: 0.18 });
    case "copper":
      return new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.85, roughness: 0.28 });
    case "platinum":
      return new THREE.MeshStandardMaterial({ color: 0xE5E4E2, metalness: 1.0, roughness: 0.08 });
    case "matte":
      return new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.02, roughness: 0.95 });
    case "glass":
      return new THREE.MeshPhysicalMaterial({
        color: 0xaaccff, transparent: true, opacity: 0.45,
        roughness: 0.0, metalness: 0.05,
        transmission: 0.7,
      } as THREE.MeshPhysicalMaterialParameters);
    case "obsidian":
      return new THREE.MeshStandardMaterial({ color: 0x111118, metalness: 0.7, roughness: 0.04 });
    default:
      return new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 1.0, roughness: 0.15 });
  }
}

interface Props {
  text: string;
  fontFamily?: string;
  fontSize?: number;
  bold?: boolean;
  color?: string;
  gradientEnabled?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  gradientAngle?: number;
  material3D?: Material3DType;
  depth?: number;
  bevel?: number;
  cameraAngleX?: number;
  cameraAngleY?: number;
  autoRotate?: boolean;
  fitToContainer?: boolean;
  onExport?: (dataUrl: string) => void;
}

const PREVIEW_H = 180;

export function Text3DCanvas({
  text = "הדר",
  fontFamily = "Frank Ruhl Libre",
  fontSize = 40,
  bold = false,
  color = "#ffffff",
  gradientEnabled = false,
  gradientFrom = "#FCF6BA",
  gradientTo = "#AA771C",
  gradientAngle = 0,
  material3D = "gold",
  depth = 8,
  bevel = 3,
  cameraAngleX = 12,
  cameraAngleY = -18,
  autoRotate = false,
  fitToContainer = false,
  onExport,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglError, setWebglError] = useState(false);
  const ctxRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    group: THREE.Group;
    rafId: number;
    rotY: number;
  } | null>(null);

  const build = useCallback(() => {
    if (!mountRef.current) return;

    // Quick WebGL availability check before attempting renderer creation
    try {
      const testCanvas = document.createElement("canvas");
      const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
      if (!gl) { setWebglError(true); return; }
    } catch { setWebglError(true); return; }

    // Cleanup previous instance
    if (ctxRef.current) {
      cancelAnimationFrame(ctxRef.current.rafId);
      ctxRef.current.renderer.dispose();
      while (mountRef.current.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }
    }

    const W = mountRef.current.clientWidth || 280;
    const H = fitToContainer ? (mountRef.current.clientHeight || PREVIEW_H) : PREVIEW_H;

    // ── Renderer ──────────────────────────────────────────────
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        failIfMajorPerformanceCaveat: false,
      });
    } catch {
      setWebglError(true);
      return;
    }
    // Verify WebGL actually initialised (some environments silently fail)
    if (!renderer.getContext()) {
      renderer.dispose();
      setWebglError(true);
      return;
    }
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    mountRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    // ── Scene ─────────────────────────────────────────────────
    const scene = new THREE.Scene();

    // ── Camera ────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
    camera.position.set(0, 0, 7);

    // ── Lights ────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));

    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(6, 10, 8);
    key.castShadow = true;
    key.shadow.mapSize.setScalar(1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 50;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xffe0a0, 0.9);
    fill.position.set(-5, -3, 5);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xaabbff, 0.5);
    rim.position.set(0, -5, -5);
    scene.add(rim);

    // Specular highlight from top-front
    const spec = new THREE.PointLight(0xffffff, 1.2, 20);
    spec.position.set(0, 3, 6);
    scene.add(spec);

    // ── Text canvas texture ────────────────────────────────────
    const TW = 512;
    const TH = 128;
    const textCanvas = document.createElement("canvas");
    textCanvas.width = TW;
    textCanvas.height = TH;
    const ctx2d = textCanvas.getContext("2d")!;

    // Load font then draw
    if (fontFamily) loadAnyFont(fontFamily);

    const fontSizePx = Math.min(96, Math.max(44, fontSize * 1.9));
    const fontStr = `${bold ? "bold " : ""}${fontSizePx}px "${fontFamily || "Frank Ruhl Libre"}", "Times New Roman", serif`;
    ctx2d.font = fontStr;
    ctx2d.textAlign = "center";
    ctx2d.textBaseline = "middle";
    ctx2d.direction = "rtl";

    if (gradientEnabled && gradientFrom && gradientTo) {
      const angle = ((gradientAngle ?? 0) + 90) * Math.PI / 180;
      const cx = TW / 2;
      const cy = TH / 2;
      const len = Math.max(TW, TH);
      const x1 = cx - Math.cos(angle) * len;
      const y1 = cy - Math.sin(angle) * len;
      const x2 = cx + Math.cos(angle) * len;
      const y2 = cy + Math.sin(angle) * len;
      const grad = ctx2d.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, gradientFrom);
      grad.addColorStop(1, gradientTo);
      ctx2d.fillStyle = grad;
    } else {
      ctx2d.fillStyle = color || "#ffffff";
    }

    // Handle multiline text
    const lines = (text || "הדר").split("\n");
    const lineH = fontSizePx * 1.15;
    const startY = TH / 2 - ((lines.length - 1) * lineH) / 2;
    lines.forEach((line, i) => ctx2d.fillText(line, TW / 2, startY + i * lineH));

    const texture = new THREE.CanvasTexture(textCanvas);
    texture.needsUpdate = true;

    // ── 3D geometry ───────────────────────────────────────────
    const slabW = 4.0;
    const slabH = 1.0;
    const depthVal = Math.max(0.06, (depth ?? 8) * 0.038);

    // BoxGeometry face order: right(0), left(1), top(2), bottom(3), front(4=+Z), back(5)
    const geometry = new THREE.BoxGeometry(slabW, slabH, depthVal, 1, 1, 1);

    const frontMat = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      roughness: 0.18,
      metalness: 0.08,
    });
    const sideMat = buildSideMaterial(material3D);
    const backMat = sideMat.clone();

    const materials: THREE.Material[] = [
      sideMat,   // right
      sideMat,   // left
      sideMat,   // top
      sideMat,   // bottom
      frontMat,  // front (+Z) ← text face
      backMat,   // back
    ];

    const mesh = new THREE.Mesh(geometry, materials);
    mesh.castShadow = true;

    // Bevel rings — thin slabs at the front edge for highlight
    const bevelVal = Math.max(0, (bevel ?? 3) * 0.005);
    if (bevelVal > 0.005) {
      const bevelGeo = new THREE.BoxGeometry(slabW + 0.01, slabH + 0.01, bevelVal);
      const bevelMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.8,
        roughness: 0.1,
        transparent: true,
        opacity: 0.25,
      });
      const bevelMesh = new THREE.Mesh(bevelGeo, bevelMat);
      bevelMesh.position.z = depthVal / 2 + bevelVal / 2;
      mesh.add(bevelMesh);
    }

    // ── Group (for camera angle + auto-rotate) ────────────────
    const group = new THREE.Group();
    group.add(mesh);
    group.rotation.x = ((cameraAngleX ?? 12) * Math.PI) / 180;
    group.rotation.y = ((cameraAngleY ?? -18) * Math.PI) / 180;
    scene.add(group);

    // ── Shadow catcher ────────────────────────────────────────
    const shadowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 8),
      new THREE.ShadowMaterial({ opacity: 0.28 }),
    );
    shadowMesh.receiveShadow = true;
    shadowMesh.position.set(0, -slabH / 2 - 0.35, -depthVal / 2);
    shadowMesh.rotation.x = -Math.PI / 2;
    scene.add(shadowMesh);

    // ── Animation loop ─────────────────────────────────────────
    let rotY = ((cameraAngleY ?? -18) * Math.PI) / 180;
    let rafId: number = -1;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (autoRotate) {
        rotY += 0.006;
        group.rotation.y = rotY;
      }
      renderer.render(scene, camera);
    };
    animate();

    ctxRef.current = { renderer, scene, camera, group, rafId, rotY };
  }, [
    text, fontFamily, fontSize, bold, color,
    gradientEnabled, gradientFrom, gradientTo, gradientAngle,
    material3D, depth, bevel,
    cameraAngleX, cameraAngleY, autoRotate, fitToContainer,
  ]);

  useEffect(() => {
    // Small delay so container has a chance to size itself
    const timer = setTimeout(build, 40);
    return () => {
      clearTimeout(timer);
      if (ctxRef.current) {
        cancelAnimationFrame(ctxRef.current.rafId);
        ctxRef.current.renderer.dispose();
      }
    };
  }, [build]);

  const handleExport = () => {
    if (!ctxRef.current) return;
    const { renderer, scene, camera } = ctxRef.current;
    renderer.render(scene, camera);
    const url = renderer.domElement.toDataURL("image/png", 1.0);
    onExport?.(url);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hadar-3d-text.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // ── CSS fallback for environments where WebGL is not available ──────────
  const fallbackDepthShadow = (() => {
    const steps: string[] = [];
    const n = Math.min(depth ?? 8, 10);
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      const r = Math.round((1 - t) * 140);
      const g = Math.round((1 - t) * 90);
      steps.push(`${i * 0.8}px ${i * 0.8}px 0 rgb(${r},${g},0)`);
    }
    steps.push(`${n + 2}px ${n + 2}px ${n * 2}px rgba(0,0,0,0.7)`);
    return steps.join(", ");
  })();

  const FallbackPreview = () => (
    <div className="rounded-xl border border-primary/20 flex items-center justify-center"
      style={{ width: "100%", height: PREVIEW_H, background: "#050510", perspective: "400px" }}>
      <div style={{
        fontFamily: `'${fontFamily || "Frank Ruhl Libre"}', serif`,
        fontSize: Math.min(60, Math.max(32, (fontSize ?? 40) * 1.5)),
        fontWeight: 900,
        color: gradientEnabled ? "transparent" : (color ?? "#fff"),
        backgroundImage: gradientEnabled && gradientFrom && gradientTo
          ? `linear-gradient(${gradientAngle ?? 160}deg, ${gradientFrom}, ${gradientTo})`
          : undefined,
        WebkitBackgroundClip: gradientEnabled ? "text" : undefined,
        WebkitTextFillColor: gradientEnabled ? "transparent" : undefined,
        backgroundClip: gradientEnabled ? "text" : undefined,
        textShadow: fallbackDepthShadow,
        transform: `rotateX(${cameraAngleX ?? 12}deg) rotateY(${cameraAngleY ?? -18}deg)`,
        direction: "rtl",
        userSelect: "none",
      }}>
        {text || "הדר"}
      </div>
      <div className="absolute bottom-2 right-2 text-[8px] text-primary/30">CSS 3D mode</div>
    </div>
  );

  if (fitToContainer) {
    if (webglError) {
      return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#050510" }}>
          <span style={{
            fontFamily: `'${fontFamily || "Frank Ruhl Libre"}', serif`,
            fontSize: Math.min(48, (fontSize ?? 40) * 1.2),
            fontWeight: 900,
            color: gradientEnabled ? "transparent" : (color ?? "#fff"),
            backgroundImage: gradientEnabled && gradientFrom && gradientTo
              ? `linear-gradient(${gradientAngle ?? 160}deg, ${gradientFrom}, ${gradientTo})`
              : undefined,
            WebkitBackgroundClip: gradientEnabled ? "text" : undefined,
            WebkitTextFillColor: gradientEnabled ? "transparent" : undefined,
            backgroundClip: gradientEnabled ? "text" : undefined,
            textShadow: fallbackDepthShadow,
            direction: "rtl",
          }}>
            {text || "הדר"}
          </span>
        </div>
      );
    }
    return <div ref={mountRef} style={{ width: "100%", height: "100%", overflow: "hidden" }} />;
  }

  if (webglError) {
    return (
      <div className="space-y-2">
        <div className="relative">
          <FallbackPreview />
        </div>
        <p className="text-[9px] text-primary/40 text-center">
          תצוגה מקדימה CSS — WebGL אינו זמין בסביבה זו. ייצוא PNG יעבוד בדפדפן המשתמש.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        ref={mountRef}
        className="rounded-xl overflow-hidden border border-primary/20"
        style={{ width: "100%", height: PREVIEW_H, background: "#050510" }}
      />
      <button
        onClick={handleExport}
        className="w-full flex items-center justify-center gap-1.5 text-[11px] font-medium text-primary border border-primary/30 rounded-lg py-1.5 hover:bg-primary/10 transition-colors"
      >
        ⬇ ייצא PNG באיכות גבוהה
      </button>
    </div>
  );
}
