import { useState, type FormEvent } from 'react'
import Balloon, { BALLOONS } from '../components/Balloon'

interface LandingProps {
  onSubmit: (name: string) => void
}

export default function Landing({ onSubmit }: LandingProps) {
  const [name, setName] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-br from-rose-50 via-fuchsia-50 to-sky-100">
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
          <p className="text-sm font-medium tracking-[0.35em] text-purple-400 uppercase mb-3 select-none">
            let's
          </p>
          <h1
            className="font-display text-7xl md:text-8xl lg:text-9xl text-purple-900 leading-none select-none"
          >
            celebrate
          </h1>
        </div>

        {/* Subtext */}
        <p className="mt-5 text-purple-400 text-sm font-light tracking-wide animate-fade-slide-up-delay select-none">
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
            className="w-full bg-transparent border-0 border-b-2 border-purple-200 focus:border-purple-500 text-center text-xl text-purple-900 font-light py-3 transition-colors duration-300 placeholder:text-purple-300 placeholder:font-light"
          />

          <button
            type="submit"
            disabled={!name.trim()}
            className="mt-8 w-full py-3.5 rounded-2xl bg-purple-600 text-white font-medium text-base tracking-wide transition-all duration-200 hover:bg-purple-700 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-purple-200"
          >
            open their wishes →
          </button>
        </form>
      </div>
    </div>
  )
}
