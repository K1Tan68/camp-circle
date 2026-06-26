import { useEffect, useRef, useState } from "react";

const CYCLE = 120; // seconds

// ─── Phase ───────────────────────────────────────────────────────────────────
// t: 0~1
// 0.00~0.12  深夜
// 0.12~0.30  夜明け（朝焼け）
// 0.30~0.60  昼
// 0.60~0.78  夕暮れ
// 0.78~1.00  夜
function getPhase(t: number) {
  const lerp = (a: number, b: number, f: number) =>
    a + (b - a) * Math.max(0, Math.min(1, f));
  const ramp = (v: number, s: number, e: number) =>
    Math.max(0, Math.min(1, (v - s) / (e - s)));

  // photoBrightness: 写真の明るさ (0.28=夜, 1.0=昼)
  let photoBrightness = 0.28;
  let photoSaturate   = 0.5;
  let skyTop = "#020c1a";
  let skyBot = "#020c1a";
  let horizonGlow = "";
  let sunriseProgress = 0;
  // 焚き火glow強度 0~1
  let campfireGlow = 0;

  if (t < 0.12) {
    // 深夜
    photoBrightness = 0.28;
    photoSaturate   = 0.5;
    campfireGlow    = 1.0;
    skyTop = "#020c1a"; skyBot = "#020c1a";
  } else if (t < 0.30) {
    // 夜明け
    const p = ramp(t, 0.12, 0.30);
    sunriseProgress = p;
    photoBrightness = lerp(0.28, 0.75, p);
    photoSaturate   = lerp(0.5, 0.9, p);
    campfireGlow    = lerp(1.0, 0.0, p);
    skyTop = `rgb(${Math.round(lerp(2,38,p))},${Math.round(lerp(12,22,p))},${Math.round(lerp(26,52,p))})`;
    skyBot = `rgb(${Math.round(lerp(2,245,p*.9))},${Math.round(lerp(12,115,p*.65))},${Math.round(lerp(26,22,p))})`;
    horizonGlow = `rgba(255,${Math.round(lerp(0,135,p))},0,${lerp(0,0.62,p)})`;
  } else if (t < 0.60) {
    // 昼
    const p = ramp(t, 0.30, 0.42);
    photoBrightness = lerp(0.75, 1.0, p);
    photoSaturate   = lerp(0.9, 1.1, p);
    campfireGlow    = 0;
    skyTop = "#1a6fba"; skyBot = "#87ceeb";
  } else if (t < 0.78) {
    // 夕暮れ
    const p = ramp(t, 0.60, 0.78);
    photoBrightness = lerp(1.0, 0.28, p);
    photoSaturate   = lerp(1.1, 0.5, p);
    campfireGlow    = lerp(0, 1.0, p);
    skyTop = `rgb(${Math.round(lerp(26,2,p))},${Math.round(lerp(111,12,p))},${Math.round(lerp(186,26,p))})`;
    skyBot = `rgb(${Math.round(lerp(135,40,p))},${Math.round(lerp(206,15,p))},${Math.round(lerp(235,8,p))})`;
    horizonGlow = `rgba(255,${Math.round(lerp(100,0,p))},0,${lerp(0.5,0,p)})`;
  } else {
    // 夜
    photoBrightness = 0.28;
    photoSaturate   = 0.5;
    campfireGlow    = 1.0;
    skyTop = "#020c1a"; skyBot = "#020c1a";
  }

  return { photoBrightness, photoSaturate, skyTop, skyBot, horizonGlow, sunriseProgress, campfireGlow };
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function DayNightHero({ children }: { children?: React.ReactNode }) {
  const startRef = useRef(Date.now());
  const [t, setT] = useState(0);
  // flickerフレーム用
  const [flicker, setFlicker] = useState(0);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      setT((elapsed % CYCLE) / CYCLE);
      setFlicker(performance.now());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const { photoBrightness, photoSaturate, skyTop, skyBot, horizonGlow, sunriseProgress, campfireGlow } = getPhase(t);

  // 焚き火glowのちらつき
  const flickerA = campfireGlow > 0
    ? campfireGlow * (0.82 + Math.sin(flicker * 0.006) * 0.12 + Math.sin(flicker * 0.013) * 0.06)
    : 0;
  const flickerB = campfireGlow > 0
    ? campfireGlow * (0.75 + Math.sin(flicker * 0.009 + 1.5) * 0.15)
    : 0;

  // 焚き火は画像の中央やや左下あたり（画像確認から）
  // 1024x559 の画像で焚き火は x≒42% y≒72%
  const fireX = 42;
  const fireY = 72;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: `linear-gradient(to bottom, ${skyTop} 0%, ${skyBot} 100%)`,
        transition: "background 3s ease",
      }}
    >
      {/* 地平線グロー（夜明け・夕暮れ） */}
      {horizonGlow && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
          background: `radial-gradient(ellipse 90% 32% at 50% 100%, ${horizonGlow}, transparent 52%)`,
        }} />
      )}

      {/* 朝日レイ */}
      {sunriseProgress > 0.05 && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none",
          background: `radial-gradient(ellipse 60% 45% at 90% 38%,
            rgba(255,${Math.round(130 + sunriseProgress * 65)},15,${Math.min(1, sunriseProgress * 1.8) * 0.42}),
            transparent 62%)`,
        }} />
      )}

      {/* キャンプ写真 */}
      <img
        src="/hero-bg.png"
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center center",
          filter: `brightness(${photoBrightness}) saturate(${photoSaturate})`,
          transition: "filter 4s ease",
          zIndex: 5,
        }}
      />

      {/* 焚き火 glow オーバーレイ（夜だけ） */}
      {flickerA > 0.02 && (
        <>
          {/* メインglow（炎の光が周囲に広がる） */}
          <div style={{
            position: "absolute",
            left: `${fireX}%`,
            top: `${fireY}%`,
            transform: "translate(-50%, -50%)",
            width: "clamp(180px, 28vw, 420px)",
            height: "clamp(120px, 18vw, 280px)",
            borderRadius: "50%",
            background: `radial-gradient(ellipse,
              rgba(255,120,20,${(flickerA * 0.38).toFixed(3)}) 0%,
              rgba(255,80,10,${(flickerA * 0.20).toFixed(3)}) 35%,
              rgba(200,50,0,${(flickerA * 0.08).toFixed(3)}) 65%,
              transparent 100%)`,
            zIndex: 6,
            pointerEvents: "none",
            mixBlendMode: "screen",
          }} />
          {/* コアglow（炎の中心） */}
          <div style={{
            position: "absolute",
            left: `${fireX}%`,
            top: `${fireY - 3}%`,
            transform: "translate(-50%, -50%)",
            width: "clamp(40px, 6vw, 90px)",
            height: "clamp(50px, 8vw, 110px)",
            borderRadius: "50%",
            background: `radial-gradient(ellipse,
              rgba(255,220,100,${(flickerB * 0.55).toFixed(3)}) 0%,
              rgba(255,140,30,${(flickerB * 0.35).toFixed(3)}) 50%,
              transparent 100%)`,
            zIndex: 7,
            pointerEvents: "none",
            mixBlendMode: "screen",
          }} />
          {/* 地面への反射（足元のオレンジ） */}
          <div style={{
            position: "absolute",
            left: `${fireX}%`,
            top: `${fireY + 6}%`,
            transform: "translate(-50%, -50%)",
            width: "clamp(120px, 20vw, 320px)",
            height: "clamp(30px, 5vw, 80px)",
            borderRadius: "50%",
            background: `radial-gradient(ellipse,
              rgba(255,80,10,${(flickerA * 0.22).toFixed(3)}) 0%,
              transparent 100%)`,
            zIndex: 6,
            pointerEvents: "none",
            mixBlendMode: "screen",
          }} />
        </>
      )}

      {/* テキスト可読性用グラデーション */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 8, pointerEvents: "none",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 45%, rgba(0,0,0,0.55) 100%)",
      }} />

      {/* children */}
      <div style={{ position: "absolute", inset: 0, zIndex: 20 }}>
        {children}
      </div>
    </div>
  );
}
