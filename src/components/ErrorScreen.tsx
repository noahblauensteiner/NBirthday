interface ErrorScreenProps {
  message: string
  onBack: () => void
}

export default function ErrorScreen({ message, onBack }: ErrorScreenProps) {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-rose-50 via-fuchsia-50 to-sky-100 flex flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-4xl">😕</span>
      <p className="text-gray-600 max-w-xs">{message}</p>
      <button
        onClick={onBack}
        className="text-purple-500 text-sm underline underline-offset-2"
      >
        go back
      </button>
    </div>
  )
}
