"use client";

import { useState, useRef, useCallback } from "react";
import { radialTextRotation, fitRadialFont } from "@/lib/wheel-utils";

type Prize = {
  id: string;
  label: string;
  labelAr?: string;
  code: string;
  color: string;
  weight: number;
};

type SpinResult = {
  label: string;
  code: string;
};

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function spinWheel(prizes: Prize[]): { prize: Prize; index: number } {
  const totalWeight = prizes.reduce((s, p) => s + p.weight, 0);
  let rand = Math.random() * totalWeight;
  for (let i = 0; i < prizes.length; i++) {
    rand -= prizes[i].weight;
    if (rand <= 0) return { prize: prizes[i], index: i };
  }
  return { prize: prizes[prizes.length - 1], index: prizes.length - 1 };
}

export default function Wheel({
  prizes,
  onResult,
  locale = "en",
}: {
  prizes: Prize[];
  onResult: (r: SpinResult) => void;
  locale?: string;
}) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<SVGSVGElement>(null);

  const isAr = locale === "ar";
  const displayLabel = (p: Prize) => (isAr ? p.labelAr || p.label : p.label);

  const n = prizes.length;
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 8;
  const sliceAngle = 360 / n;
  const textR = radius * 0.6;

  const handleSpin = useCallback(() => {
    if (spinning || n === 0) return;
    setSpinning(true);

    const { index } = spinWheel(prizes);

    const segmentCenter = index * sliceAngle + sliceAngle / 2;
    const targetAngle = 360 - segmentCenter;
    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const finalRotation = rotation + extraSpins * 360 + targetAngle;

    setRotation(finalRotation);

    setTimeout(() => {
      setSpinning(false);
      onResult({ label: displayLabel(prizes[index]), code: prizes[index].code });
    }, 4500);
  }, [spinning, n, prizes, rotation, sliceAngle, onResult, isAr]);

  if (n === 0) return null;

  return (
    <div className="relative flex flex-col items-center gap-6">
      <div className="relative">
        {/* Pointer */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
          <svg width="24" height="18" viewBox="0 0 24 18">
            <polygon points="12,18 0,0 24,0" fill="#141009" stroke="#C6A05C" strokeWidth="1.5" />
          </svg>
        </div>

        <svg
          ref={wheelRef}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="drop-shadow-2xl"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning
              ? "transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
              : "none",
          }}
        >
          {/* Outer ring */}
          <circle cx={cx} cy={cy} r={radius + 6} fill="#141009" />
          <circle cx={cx} cy={cy} r={radius + 2} fill="none" stroke="#C6A05C" strokeWidth="1.5" strokeDasharray="6 3" />

          {prizes.map((prize, i) => {
            const startAngle = (i * sliceAngle * Math.PI) / 180;
            const endAngle = ((i + 1) * sliceAngle * Math.PI) / 180;
            const x1 = cx + radius * Math.cos(startAngle - Math.PI / 2);
            const y1 = cy + radius * Math.sin(startAngle - Math.PI / 2);
            const x2 = cx + radius * Math.cos(endAngle - Math.PI / 2);
            const y2 = cy + radius * Math.sin(endAngle - Math.PI / 2);
            const largeArc = sliceAngle > 180 ? 1 : 0;
            const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

            const { r, g, b } = hexToRgb(prize.color);
            const darker = `rgb(${Math.max(0, r - 25)},${Math.max(0, g - 25)},${Math.max(0, b - 25)})`;

            const midAngle = i * sliceAngle + sliceAngle / 2;
            const midRad = (midAngle * Math.PI) / 180;
            const tx = cx + textR * Math.cos(midRad - Math.PI / 2);
            const ty = cy + textR * Math.sin(midRad - Math.PI / 2);
            const textRotation = radialTextRotation(midAngle);
            const fontSize = fitRadialFont(displayLabel(prize), textR, radius, 24);

            return (
              <g key={prize.id}>
                <path d={path} fill={prize.color} stroke={darker} strokeWidth="0.5" />
                <text
                  x={tx}
                  y={ty}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize={fontSize}
                  fontWeight="700"
                  transform={`rotate(${textRotation}, ${tx}, ${ty})`}
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
                >
                  {displayLabel(prize)}
                </text>
              </g>
            );
          })}

          {/* Center */}
          <circle cx={cx} cy={cy} r="20" fill="#141009" />
          <circle cx={cx} cy={cy} r="20" fill="none" stroke="#C6A05C" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r="7" fill="#C6A05C" />
        </svg>
      </div>

      <button
        onClick={handleSpin}
        disabled={spinning}
        className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none"
      >
        {spinning ? (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {isAr ? "جاري الدوران..." : "Spinning..."}
          </span>
        ) : isAr ? "دور" : "SPIN"}
      </button>
    </div>
  );
}
