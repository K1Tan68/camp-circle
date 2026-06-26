import { useEffect, useRef } from "react";

// ─── Sky Canvas ───────────────────────────────────────────────────────────────
// 1サイクル = 120秒
// t: 0.00 = 深夜  0.25 = 日の出  0.42 = 昼  0.60 = 夕方  0.75 = 夕焼け  0.85〜 = 夜

const CYCLE = 120_000; // ms

// 空グラデーション (top=上端, bot=下端/地平線付近)
const SKY_STOPS = [
  { t: 0.00, top: "#020818", bot: "#0d1a3a" }, // 深夜
  { t: 0.20, top: "#0a1040", bot: "#1a1060" }, // 夜明け前
  { t: 0.25, top: "#c0392b", bot: "#e67e22" }, // 日の出（赤オレンジ）
  { t: 0.33, top: "#2980b9", bot: "#f39c12" }, // 朝（青×オレンジ）
  { t: 0.42, top: "#1a6fba", bot: "#87ceeb" }, // 昼（青空）
  { t: 0.55, top: "#1565c0", bot: "#64b5f6" }, // 昼後半
  { t: 0.65, top: "#e67e22", bot: "#f1c40f" }, // 夕方前
  { t: 0.75, top: "#922b21", bot: "#e74c3c" }, // 夕焼け
  { t: 0.85, top: "#1a0a2e", bot: "#2c1a4e" }, // 夜へ
  { t: 1.00, top: "#020818", bot: "#0d1a3a" }, // 深夜
];

function hexToRgb(hex: string) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}
function lerpColor(a: string, b: string, t: number): string {
  const ca = hexToRgb(a), cb = hexToRgb(b);
  return `rgb(${Math.round(ca[0] + (cb[0] - ca[0]) * t)},${Math.round(ca[1] + (cb[1] - ca[1]) * t)},${Math.round(ca[2] + (cb[2] - ca[2]) * t)})`;
}
function getSkyColors(t: number) {
  for (let i = 0; i < SKY_STOPS.length - 1; i++) {
    const a = SKY_STOPS[i], b = SKY_STOPS[i + 1];
    if (t >= a.t && t <= b.t) {
      const f = (t - a.t) / (b.t - a.t);
      return { top: lerpColor(a.top, b.top, f), bot: lerpColor(a.bot, b.bot, f) };
    }
  }
  return { top: SKY_STOPS[0].top, bot: SKY_STOPS[0].bot };
}

// 星
function makeStars(n: number) {
  return Array.from({ length: n }, () => ({
    x: Math.random(),
    y: Math.random() * 0.8,
    r: Math.random() * 1.6 + 0.3,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.02 + 0.005,
  }));
}

interface Meteor { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }

export default function SkyCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef(makeStars(220));
  const meteorsRef = useRef<Meteor[]>([]);
  const rafRef = useRef<number>(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
    }
    resize();
    window.addEventListener("resize", resize);

    let lastMeteorTime = 0;

    function draw(now: number) {
      if (!canvas) return;
      const W = canvas.width, H = canvas.height;
      const t = ((now - startRef.current) % CYCLE) / CYCLE; // 0〜1

      // ── フェーズ計算 ──
      // 夜の度合い（0=完全に昼, 1=完全に夜）
      const nightness =
        t < 0.22 ? 1 - t / 0.22 :          // 夜明けへ減衰
        t < 0.75 ? 0 :                       // 昼〜夕方は0
        t < 0.85 ? (t - 0.75) / 0.10 :      // 夜に増加
        1;

      // 日の出/夕焼けの度合い
      const sunrise = (t > 0.22 && t < 0.38) ? Math.sin(((t - 0.22) / 0.16) * Math.PI) : 0;
      const sunset  = (t > 0.62 && t < 0.78) ? Math.sin(((t - 0.62) / 0.16) * Math.PI) : 0;
      const dawnDusk = Math.max(sunrise, sunset);

      // 昼の度合い
      const daytime =
        t < 0.28 ? 0 :
        t < 0.38 ? (t - 0.28) / 0.10 :
        t < 0.60 ? 1 :
        t < 0.70 ? 1 - (t - 0.60) / 0.10 :
        0;

      // ── 空グラデーション ──
      const { top, bot } = getSkyColors(t);
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, top);
      skyGrad.addColorStop(1, bot);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // ── 日の出/夕焼けのグロー（地平線） ──
      if (dawnDusk > 0.05) {
        const isS = sunset > sunrise;
        const glowColor = isS ? "255,100,30" : "255,140,50";
        const horizonGrad = ctx.createLinearGradient(0, H * 0.4, 0, H);
        horizonGrad.addColorStop(0, `rgba(${glowColor},0)`);
        horizonGrad.addColorStop(0.5, `rgba(${glowColor},${dawnDusk * 0.35})`);
        horizonGrad.addColorStop(1, `rgba(${glowColor},${dawnDusk * 0.15})`);
        ctx.fillStyle = horizonGrad;
        ctx.fillRect(0, 0, W, H);
      }

      // ── 昼の空ハイライト ──
      if (daytime > 0.05) {
        const skyShine = ctx.createLinearGradient(0, 0, 0, H * 0.5);
        skyShine.addColorStop(0, `rgba(100,170,255,${daytime * 0.12})`);
        skyShine.addColorStop(1, `rgba(100,170,255,0)`);
        ctx.fillStyle = skyShine;
        ctx.fillRect(0, 0, W, H);
      }

      // ── 星（夜のみ） ──
      if (nightness > 0.02) {
        ctx.save();
        for (const s of starsRef.current) {
          const twinkle = 0.55 + 0.45 * Math.sin(s.phase + now * 0.001 * s.speed * 60);
          ctx.beginPath();
          ctx.arc(s.x * W, s.y * H, s.r * devicePixelRatio, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${nightness * twinkle * 0.9})`;
          ctx.fill();
        }
        ctx.restore();
      }

      // ── 流れ星（夜のみ） ──
      if (nightness > 0.5) {
        const interval = 3500 + Math.random() * 6000;
        if (now - lastMeteorTime > interval) {
          lastMeteorTime = now;
          const angle = (15 + Math.random() * 25) * (Math.PI / 180);
          const spd = (1.8 + Math.random() * 2.5) * devicePixelRatio;
          meteorsRef.current.push({
            x: Math.random() * W * 0.75,
            y: Math.random() * H * 0.35,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            life: 0,
            maxLife: 50 + Math.random() * 35,
          });
        }
        meteorsRef.current = meteorsRef.current.filter(m => m.life < m.maxLife);
        for (const m of meteorsRef.current) {
          const prog = m.life / m.maxLife;
          const alpha = nightness * (1 - prog) * 0.85;
          const tailX = m.x - m.vx * 22;
          const tailY = m.y - m.vy * 22;
          const mGrad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
          mGrad.addColorStop(0, `rgba(255,255,255,0)`);
          mGrad.addColorStop(1, `rgba(255,255,255,${alpha})`);
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(m.x, m.y);
          ctx.strokeStyle = mGrad;
          ctx.lineWidth = 1.4 * devicePixelRatio;
          ctx.stroke();
          m.x += m.vx; m.y += m.vy; m.life++;
        }
      }

      // ── 月（夜〜薄明、t=0.75〜1.0 & 0.0〜0.22） ──
      if (nightness > 0.02) {
        // 夜中に弧を描く (t=0.75で東から昇り、t=1.0/0.0で頂点、t=0.22で西へ沈む)
        let nt: number;
        if (t >= 0.75) nt = (t - 0.75) / 0.47;
        else if (t <= 0.22) nt = (t + 0.25) / 0.47;
        else nt = 0.5; // 昼中は非表示（nightness=0なので描画されない）

        const moonAngle = Math.PI * (1 - nt); // π→0: 左地平→頂点→右地平
        const cx = W * 0.5 + Math.cos(moonAngle) * W * 0.36;
        const cy = H * 0.15 + (1 - Math.sin(moonAngle)) * H * 0.50;
        const moonR = 20 * devicePixelRatio;

        ctx.save();
        ctx.globalAlpha = nightness;
        // 月光グロー
        const mGlow = ctx.createRadialGradient(cx, cy, moonR * 0.5, cx, cy, moonR * 5);
        mGlow.addColorStop(0, "rgba(240,240,200,0.22)");
        mGlow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = mGlow;
        ctx.fillRect(cx - moonR * 5, cy - moonR * 5, moonR * 10, moonR * 10);
        // 月本体
        ctx.beginPath();
        ctx.arc(cx, cy, moonR, 0, Math.PI * 2);
        ctx.fillStyle = "#fffde7";
        ctx.shadowColor = "rgba(255,255,200,0.6)";
        ctx.shadowBlur = 12 * devicePixelRatio;
        ctx.fill();
        ctx.shadowBlur = 0;
        // クレーター
        ctx.globalAlpha = nightness * 0.12;
        for (const [ox, oy, or_] of [[0.28, -0.25, 0.14], [-0.22, 0.3, 0.09], [0.1, 0.38, 0.07]] as [number,number,number][]) {
          ctx.beginPath();
          ctx.arc(cx + ox * moonR, cy + oy * moonR, or_ * moonR, 0, Math.PI * 2);
          ctx.fillStyle = "#999";
          ctx.fill();
        }
        ctx.restore();
      }

      // ── 太陽（日の出〜夕方、t=0.22〜0.78） ──
      if (t > 0.22 && t < 0.78) {
        // t=0.22で東の地平から昇り、t=0.50で頂点、t=0.78で西の地平へ沈む
        const sunProgress = (t - 0.22) / 0.56; // 0〜1
        const sunAngle = Math.PI * (1 - sunProgress); // π→0: 左→頂点→右
        const sx = W * 0.5 + Math.cos(sunAngle) * W * 0.36;
        const sy = H * 0.12 + (1 - Math.sin(sunAngle)) * H * 0.52;
        const sunR = 26 * devicePixelRatio;

        const isRisingOrSetting = sunProgress < 0.2 || sunProgress > 0.8;
        const sunAlpha = Math.min(1, sunProgress < 0.08 ? sunProgress / 0.08 : sunProgress > 0.92 ? (1 - sunProgress) / 0.08 : 1);

        ctx.save();
        ctx.globalAlpha = sunAlpha;
        // コロナ
        const coronaColor = isRisingOrSetting ? "255,140,40" : "255,230,80";
        const corona = ctx.createRadialGradient(sx, sy, sunR * 0.8, sx, sy, sunR * 6);
        corona.addColorStop(0, `rgba(${coronaColor},0.5)`);
        corona.addColorStop(0.3, `rgba(${coronaColor},0.15)`);
        corona.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = corona;
        ctx.fillRect(sx - sunR * 6, sy - sunR * 6, sunR * 12, sunR * 12);
        // 太陽本体
        ctx.beginPath();
        ctx.arc(sx, sy, sunR, 0, Math.PI * 2);
        const sunBody = ctx.createRadialGradient(sx - sunR * 0.25, sy - sunR * 0.25, 0, sx, sy, sunR);
        if (isRisingOrSetting) {
          sunBody.addColorStop(0, "#fff0d0");
          sunBody.addColorStop(0.5, "#ff9020");
          sunBody.addColorStop(1, "#e05000");
        } else {
          sunBody.addColorStop(0, "#fffff0");
          sunBody.addColorStop(0.5, "#ffe840");
          sunBody.addColorStop(1, "#ffa000");
        }
        ctx.fillStyle = sunBody;
        ctx.shadowColor = isRisingOrSetting ? "rgba(255,120,0,0.7)" : "rgba(255,240,0,0.5)";
        ctx.shadowBlur = 20 * devicePixelRatio;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
