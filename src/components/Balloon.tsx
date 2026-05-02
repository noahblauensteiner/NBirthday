interface BalloonProps {
  x: number
  delay: number
  duration: number
  color: string
  size?: number
}

export default function Balloon({ x, delay, duration, color, size = 1 }: BalloonProps) {
  const w = 52 * size
  const h = 82 * size
  const swayDuration = duration * 0.3

  return (
    <div
      className="absolute bottom-0 pointer-events-none"
      style={{
        left: `${x}%`,
        '--duration': `${duration}s`,
        '--delay': `${delay}s`,
        '--sway-duration': `${swayDuration}s`,
      } as React.CSSProperties}
    >
      <div className="animate-float-up">
        <div className="animate-sway">
          <svg width={w} height={h} viewBox="0 0 52 82" fill="none">
            {/* Body */}
            <ellipse cx="26" cy="28" rx="21" ry="25" fill={color} />
            {/* Highlight */}
            <ellipse
              cx="17"
              cy="17"
              rx="6"
              ry="9"
              fill="rgba(255,255,255,0.28)"
              transform="rotate(-20 17 17)"
            />
            {/* Knot */}
            <circle cx="26" cy="54" r="2.8" fill={color} />
            {/* String */}
            <path
              d="M26 57 C19 64 33 72 26 80"
              stroke={color}
              strokeWidth="1.5"
              strokeOpacity="0.6"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

export const BALLOONS: BalloonProps[] = [
  { x: 4,  delay: 0,   duration: 14, color: '#FF6B6B', size: 1.0 },
  { x: 14, delay: 2.5, duration: 11, color: '#FFD93D', size: 0.8 },
  { x: 23, delay: 5.5, duration: 13, color: '#6BCB77', size: 1.1 },
  { x: 35, delay: 1.0, duration: 16, color: '#4D96FF', size: 0.9 },
  { x: 47, delay: 8.0, duration: 12, color: '#FF6BCC', size: 1.0 },
  { x: 58, delay: 3.5, duration: 15, color: '#C77DFF', size: 1.15 },
  { x: 69, delay: 6.5, duration: 11, color: '#FF8C42', size: 0.85 },
  { x: 79, delay: 4.0, duration: 14, color: '#2DE1FC', size: 1.0 },
  { x: 89, delay: 9.5, duration: 13, color: '#FF6B6B', size: 0.9 },
  { x: 96, delay: 1.8, duration: 12, color: '#FFD93D', size: 1.05 },
]
