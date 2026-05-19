import { useState, type FormEvent } from 'react'
import Balloon, { BALLOONS } from '../components/Balloon'

interface LandingProps {
  onSubmit: (name: string) => void
  isDark: boolean
  onToggleDark: () => void
}

export default function Landing({ onSubmit, isDark, onToggleDark }: LandingProps) {
  const [name, setName] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-br from-rose-50 via-fuchsia-50 to-sky-100 dark:from-slate-950 dark:via-purple-950/60 dark:to-slate-900">
      {/* Dark mode toggle */}
      <button
        onClick={onToggleDark}
        aria-label="Toggle dark mode"
        className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-xl text-lg bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 backdrop-blur-sm transition-colors"
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      {/* Balloons layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {BALLOONS.map((b, i) => (
          <Balloon key={i} {...b} />
        ))}
      </div>

      {/* Centered content */}
      <div className="relative z-10 min-h-dvh flex flex-col items-center justify-center px-6 text-center">
        {/* Heading */}
        <div className="animate-fade-slide-up">
          <p className="text-sm font-medium tracking-[0.35em] text-purple-400 dark:text-purple-400 uppercase mb-3 select-none">
            let's
          </p>
          <h1 className="font-display text-7xl md:text-8xl lg:text-9xl text-purple-900 dark:text-purple-200 leading-none select-none">
            celebrate
          </h1>
        </div>

        {/* Subtext */}
        <p className="mt-5 text-purple-400 dark:text-purple-500 text-sm font-light tracking-wide animate-fade-slide-up-delay select-none">
          birthdays, shared
        </p>

        {/* Name input */}
        <form
          onSubmit={handleSubmit}
          className="mt-14 w-full max-w-xs animate-fade-slide-up-delay-2"
        >
          <input
            autoFocus
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="whose birthday is it? ✨"
            maxLength={40}
            className="w-full bg-transparent border-0 border-b-2 border-purple-200 dark:border-purple-800 focus:border-purple-500 dark:focus:border-purple-400 text-center text-xl text-purple-900 dark:text-purple-100 font-light py-3 transition-colors duration-300 placeholder:text-purple-300 dark:placeholder:text-purple-700 placeholder:font-light outline-none"
          />

          <button
            type="submit"
            disabled={!name.trim()}
            className="mt-8 w-full py-3.5 rounded-2xl bg-purple-600 text-white font-medium text-base tracking-wide transition-all duration-200 hover:bg-purple-700 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-purple-200 dark:shadow-purple-950"
          >
            open their wishes →
          </button>
        </form>
      </div>
    </div>
  )
}
