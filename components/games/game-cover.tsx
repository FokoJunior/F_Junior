"use client"

import type { GameId } from "@/lib/games"
import { cn } from "@/lib/utils"

export default function GameCover({ gameId, className }: { gameId: GameId; className?: string }) {
  return (
    <div
      className={cn(
        "relative aspect-[16/9] w-full overflow-hidden rounded-md border border-border/80 bg-[#0d111a]",
        className,
      )}
    >
      <svg
        viewBox="0 0 320 180"
        className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        aria-hidden
      >
        <defs>
          <radialGradient id={`glow-${gameId}`} cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#0d111a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="320" height="180" fill="#0d111a" />
        <rect width="320" height="180" fill={`url(#glow-${gameId})`} />

        {gameId === "snake" && (
          <g>
            {/* Subtle grid */}
            {[40, 80, 120, 160, 200, 240, 280].map((x) => (
              <line key={x} x1={x} y1="0" x2={x} y2="180" stroke="#ffffff" strokeOpacity="0.05" />
            ))}
            {[36, 72, 108, 144].map((y) => (
              <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="#ffffff" strokeOpacity="0.05" />
            ))}
            {/* Snake body */}
            <rect x="64" y="104" width="24" height="24" rx="6" fill="#64748b" />
            <rect x="92" y="104" width="24" height="24" rx="6" fill="#475569" />
            <rect x="120" y="104" width="24" height="24" rx="6" fill="#3b82f6" opacity="0.7" />
            <rect x="120" y="76" width="24" height="24" rx="6" fill="#3b82f6" opacity="0.85" />
            <rect x="148" y="76" width="24" height="24" rx="6" fill="#3b82f6" />
            <rect x="176" y="76" width="26" height="26" rx="8" fill="#60a5fa" />
            <circle cx="195" cy="84" r="2.5" fill="#0d111a" />
            <circle cx="195" cy="94" r="2.5" fill="#0d111a" />
            {/* Apple */}
            <circle cx="244" cy="89" r="11" fill="#f97316" />
            <circle cx="244" cy="89" r="18" fill="#f97316" opacity="0.2" />
          </g>
        )}

        {gameId === "2048" && (
          <g transform="translate(88, 18)">
            <rect width="144" height="144" rx="10" fill="#161c28" stroke="#263042" />
            {[
              { x: 10, y: 10, n: "2", bg: "#1e2636", fg: "#e2e8f0" },
              { x: 44, y: 10, n: "16", bg: "#1d4ed8", fg: "#ffffff" },
              { x: 78, y: 10, n: "64", bg: "#2563eb", fg: "#ffffff" },
              { x: 112, y: 10, n: "4", bg: "#1e2636", fg: "#e2e8f0" },
              { x: 10, y: 44, n: "8", bg: "#1e3a8a", fg: "#93c5fd" },
              { x: 44, y: 44, n: "256", bg: "#7c3aed", fg: "#ffffff" },
              { x: 78, y: 44, n: "512", bg: "#f59e0b", fg: "#0f172a" },
              { x: 112, y: 44, n: "32", bg: "#3b82f6", fg: "#ffffff" },
              { x: 10, y: 78, n: "4", bg: "#1e2636", fg: "#e2e8f0" },
              { x: 44, y: 78, n: "128", bg: "#4f46e5", fg: "#ffffff" },
              { x: 78, y: 78, n: "2048", bg: "#f8fafc", fg: "#0f172a" },
              { x: 112, y: 78, n: "16", bg: "#1d4ed8", fg: "#ffffff" },
              { x: 10, y: 112, n: "2", bg: "#1e2636", fg: "#e2e8f0" },
              { x: 44, y: 112, n: "8", bg: "#1e3a8a", fg: "#93c5fd" },
              { x: 78, y: 112, n: "64", bg: "#2563eb", fg: "#ffffff" },
              { x: 112, y: 112, n: "2", bg: "#1e2636", fg: "#e2e8f0" },
            ].map((t, i) => (
              <g key={i}>
                <rect x={t.x} y={t.y} width="26" height="26" rx="4" fill={t.bg} />
                <text
                  x={t.x + 13}
                  y={t.y + 17}
                  textAnchor="middle"
                  fontFamily="monospace"
                  fontSize={t.n.length > 3 ? "8" : "10"}
                  fontWeight="700"
                  fill={t.fg}
                >
                  {t.n}
                </text>
              </g>
            ))}
          </g>
        )}

        {gameId === "tictactoe" && (
          <g transform="translate(96, 26)">
            <line x1="42" y1="6" x2="42" y2="122" stroke="#334155" strokeWidth="2.5" />
            <line x1="86" y1="6" x2="86" y2="122" stroke="#334155" strokeWidth="2.5" />
            <line x1="6" y1="42" x2="122" y2="42" stroke="#334155" strokeWidth="2.5" />
            <line x1="6" y1="86" x2="122" y2="86" stroke="#334155" strokeWidth="2.5" />
            {/* Winning diagonal X */}
            <line x1="12" y1="12" x2="116" y2="116" stroke="#3b82f6" strokeOpacity="0.35" strokeWidth="10" strokeLinecap="round" />
            {[[21, 21], [64, 64], [107, 107]].map(([cx, cy], idx) => (
              <g key={idx} stroke="#60a5fa" strokeWidth="3.5" strokeLinecap="round">
                <line x1={cx - 10} y1={cy - 10} x2={cx + 10} y2={cy + 10} />
                <line x1={cx + 10} y1={cy - 10} x2={cx - 10} y2={cy + 10} />
              </g>
            ))}
            <circle cx="64" cy="21" r="11" fill="none" stroke="#e2e8f0" strokeWidth="3" />
            <circle cx="21" cy="107" r="11" fill="none" stroke="#e2e8f0" strokeWidth="3" />
          </g>
        )}

        {gameId === "memory" && (
          <g transform="translate(62, 26)">
            {[0, 1, 2, 3].map((c) =>
              [0, 1].map((r) => {
                const matched = (r === 0 && c === 1) || (r === 1 && c === 2)
                return (
                  <g key={`${r}-${c}`} transform={`translate(${c * 52}, ${r * 66})`}>
                    <rect
                      width="42"
                      height="56"
                      rx="7"
                      fill={matched ? "#1d4ed8" : "#161d2b"}
                      stroke={matched ? "#60a5fa" : "#2b3548"}
                      strokeWidth="1.5"
                    />
                    <text
                      x="21"
                      y="34"
                      textAnchor="middle"
                      fontFamily="monospace"
                      fontSize="14"
                      fontWeight="700"
                      fill={matched ? "#ffffff" : "#64748b"}
                    >
                      {matched ? "</>" : "F_J"}
                    </text>
                  </g>
                )
              }),
            )}
          </g>
        )}

        {gameId === "reaction" && (
          <g>
            <circle cx="160" cy="90" r="56" fill="#2563eb" opacity="0.18" />
            <circle cx="160" cy="90" r="38" fill="#2563eb" />
            <path d="M165 65 L146 93 H160 L155 115 L174 87 H160 Z" fill="#ffffff" />
            <text x="160" y="160" textAnchor="middle" fontFamily="monospace" fontSize="13" fill="#93c5fd">
              184 ms · FLASH
            </text>
          </g>
        )}

        {gameId === "breakout" && (
          <g>
            {["#3b82f6", "#6366f1", "#8b5cf6", "#f59e0b"].map((color, r) =>
              [0, 1, 2, 3, 4, 5].map((c) => {
                if (r === 3 && (c === 2 || c === 3)) return null
                return (
                  <rect
                    key={`${r}-${c}`}
                    x={36 + c * 42}
                    y={24 + r * 18}
                    width="36"
                    height="12"
                    rx="3"
                    fill={color}
                  />
                )
              }),
            )}
            <circle cx="176" cy="116" r="6" fill="#f8fafc" />
            <rect x="122" y="150" width="76" height="10" rx="5" fill="#60a5fa" />
          </g>
        )}

        {gameId === "minesweeper" && (
          <g transform="translate(88, 22)">
            {[0, 1, 2, 3, 4].map((r) =>
              [0, 1, 2, 3, 4].map((c) => {
                const open = (r + c) % 3 !== 0
                const flag = r === 1 && c === 2
                const num = r === 2 && c === 1 ? "2" : r === 2 && c === 3 ? "1" : r === 3 && c === 2 ? "3" : ""
                return (
                  <g key={`${r}-${c}`} transform={`translate(${c * 29}, ${r * 27})`}>
                    <rect
                      width="25"
                      height="23"
                      rx="4"
                      fill={open ? "#131926" : "#1f293d"}
                      stroke={flag ? "#3b82f6" : "#2d394f"}
                    />
                    {flag && <circle cx="12.5" cy="11.5" r="5" fill="#ef4444" />}
                    {num && (
                      <text
                        x="12.5"
                        y="16"
                        textAnchor="middle"
                        fontFamily="monospace"
                        fontSize="12"
                        fontWeight="700"
                        fill={num === "1" ? "#60a5fa" : num === "2" ? "#34d399" : "#fb7185"}
                      >
                        {num}
                      </text>
                    )}
                  </g>
                )
              }),
            )}
          </g>
        )}

        {gameId === "typing" && (
          <g transform="translate(36, 36)">
            <rect width="248" height="108" rx="10" fill="#131926" stroke="#28344a" />
            <circle cx="18" cy="18" r="4" fill="#ef4444" />
            <circle cx="32" cy="18" r="4" fill="#f59e0b" />
            <circle cx="46" cy="18" r="4" fill="#10b981" />
            <text x="18" y="54" fontFamily="monospace" fontSize="14" fill="#34d399">
              const next = &quot;fast&quot;
            </text>
            <text x="18" y="80" fontFamily="monospace" fontSize="14" fill="#60a5fa">
              async deploy()
            </text>
            <rect x="142" y="67" width="8" height="16" fill="#60a5fa" />
          </g>
        )}

        {gameId === "simon" && (
          <g transform="translate(96, 26)">
            <rect x="0" y="0" width="60" height="60" rx="12" fill="#3b82f6" />
            <rect x="68" y="0" width="60" height="60" rx="12" fill="#10b981" opacity="0.4" />
            <rect x="0" y="68" width="60" height="60" rx="12" fill="#f59e0b" opacity="0.4" />
            <rect x="68" y="68" width="60" height="60" rx="12" fill="#f43f5e" opacity="0.4" />
          </g>
        )}

        {gameId === "puzzle" && (
          <g transform="translate(92, 22)">
            {[
              { r: 0, c: 0, fill: "#1d4ed8", n: "1" },
              { r: 0, c: 1, fill: "#2563eb", n: "2" },
              { r: 0, c: 2, fill: "#38bdf8", n: "3" },
              { r: 1, c: 0, fill: "#312e81", n: "4" },
              { r: 1, c: 1, fill: "#f59e0b", n: "5" },
              { r: 1, c: 2, fill: "#4f46e5", n: "6" },
              { r: 2, c: 0, fill: "#0f766e", n: "7" },
              { r: 2, c: 1, fill: "#1e40af", n: "8" },
            ].map((p) => (
              <g key={p.n} transform={`translate(${p.c * 46}, ${p.r * 46})`}>
                <rect width="42" height="42" rx="6" fill={p.fill} />
                <text x="10" y="16" fontFamily="monospace" fontSize="10" fontWeight="700" fill="#ffffff" opacity="0.9">
                  {p.n}
                </text>
              </g>
            ))}
            <rect
              x="92"
              y="92"
              width="42"
              height="42"
              rx="6"
              fill="none"
              stroke="#60a5fa"
              strokeDasharray="4 4"
            />
          </g>
        )}

        {gameId === "connect4" && (
          <g transform="translate(62, 24)">
            <rect width="196" height="132" rx="10" fill="#161f32" stroke="#2a3954" />
            {[0, 1, 2, 3, 4, 5, 6].map((c) =>
              [0, 1, 2, 3].map((r) => {
                const isBlue = (r === 3 && c >= 1 && c <= 4) || (r === 2 && c === 2)
                const isAmber = (r === 3 && (c === 0 || c === 5)) || (r === 2 && c === 3)
                return (
                  <circle
                    key={`${r}-${c}`}
                    cx={20 + c * 26}
                    cy={26 + r * 28}
                    r="9.5"
                    fill={isBlue ? "#3b82f6" : isAmber ? "#f59e0b" : "#0d111a"}
                    stroke={isBlue && r === 3 ? "#ffffff" : "none"}
                    strokeWidth="1.5"
                  />
                )
              }),
            )}
          </g>
        )}

        {gameId === "duo-tictactoe" && (
          <g>
            <rect x="34" y="54" width="84" height="72" rx="10" fill="#161f32" stroke="#3b82f6" />
            <text x="76" y="102" textAnchor="middle" fontFamily="Georgia, serif" fontSize="40" fill="#60a5fa">
              X
            </text>
            <text x="160" y="96" textAnchor="middle" fontFamily="monospace" fontSize="14" fontWeight="700" fill="#94a3b8">
              VS
            </text>
            <rect x="202" y="54" width="84" height="72" rx="10" fill="#161f32" stroke="#f59e0b" />
            <text x="244" y="102" textAnchor="middle" fontFamily="Georgia, serif" fontSize="40" fill="#fbbf24">
              O
            </text>
          </g>
        )}

        {gameId === "rps" && (
          <g fontSize="34" textAnchor="middle">
            <rect x="40" y="54" width="68" height="72" rx="10" fill="#161f32" stroke="#2c3a54" />
            <text x="74" y="102">🪨</text>
            <rect x="126" y="54" width="68" height="72" rx="10" fill="#1d4ed8" stroke="#60a5fa" />
            <text x="160" y="102">📄</text>
            <rect x="212" y="54" width="68" height="72" rx="10" fill="#161f32" stroke="#2c3a54" />
            <text x="246" y="102">✂️</text>
          </g>
        )}

        {gameId === "quiz" && (
          <g transform="translate(52, 28)">
            <rect width="216" height="124" rx="10" fill="#151d2e" stroke="#2a3954" />
            <text x="18" y="34" fontFamily="monospace" fontSize="11" fill="#60a5fa">
              QUIZ DEV · 1V1
            </text>
            <rect x="18" y="48" width="180" height="22" rx="5" fill="#1d4ed8" />
            <text x="28" y="63" fontFamily="monospace" fontSize="10" fill="#ffffff">
              A · useState() ✓
            </text>
            <rect x="18" y="78" width="180" height="22" rx="5" fill="#1e293b" />
            <text x="28" y="93" fontFamily="monospace" fontSize="10" fill="#94a3b8">
              B · useEffect()
            </text>
          </g>
        )}

        {(gameId === "chess" || gameId === "duo-chess") && (
          <g transform="translate(88, 18)">
            <rect width="144" height="144" rx="8" fill="#161d2b" stroke="#2c3a54" />
            {[0, 1, 2, 3].map((r) =>
              [0, 1, 2, 3].map((c) => (
                <rect
                  key={`${r}-${c}`}
                  x={4 + c * 34}
                  y={4 + r * 34}
                  width="34"
                  height="34"
                  fill={(r + c) % 2 === 0 ? "#2a3548" : "#121826"}
                />
              )),
            )}
            <text x="55" y="64" textAnchor="middle" fontSize="28" fill="#ffffff">
              ♛
            </text>
            <text x="89" y="98" textAnchor="middle" fontSize="28" fill="#60a5fa">
              ♞
            </text>
            <text x="123" y="30" textAnchor="middle" fontSize="26" fill="#f59e0b">
              ♚
            </text>
            {gameId === "duo-chess" && (
              <g>
                <rect x="34" y="114" width="76" height="22" rx="11" fill="#2563eb" />
                <text x="72" y="129" textAnchor="middle" fontFamily="monospace" fontSize="11" fontWeight="700" fill="#ffffff">
                  1V1 LIVE
                </text>
              </g>
            )}
          </g>
        )}

        {gameId === "duo-reaction" && (
          <g>
            <rect x="28" y="40" width="114" height="100" rx="10" fill="#1d4ed8" opacity="0.9" />
            <text x="85" y="88" textAnchor="middle" fontFamily="monospace" fontSize="20" fontWeight="700" fill="#ffffff">
              192ms
            </text>
            <text x="85" y="110" textAnchor="middle" fontFamily="monospace" fontSize="10" fill="#bfdbfe">
              P1 · WIN
            </text>
            <rect x="178" y="40" width="114" height="100" rx="10" fill="#161f32" stroke="#2d3b54" />
            <text x="235" y="88" textAnchor="middle" fontFamily="monospace" fontSize="20" fontWeight="700" fill="#cbd5e1">
              241ms
            </text>
            <text x="235" y="110" textAnchor="middle" fontFamily="monospace" fontSize="10" fill="#64748b">
              P2
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}
