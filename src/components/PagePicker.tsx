interface PageResult {
  id: string
  personName: string
  createdAt: string
}

interface PagePickerProps {
  results: PageResult[]
  onSelect: (id: string) => void
  onBack: () => void
}

export default function PagePicker({ results, onSelect, onBack }: PagePickerProps) {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-rose-50 via-fuchsia-50 to-sky-100 flex flex-col items-center justify-center gap-3 px-6">
      <span className="text-4xl mb-1">🎂</span>
      <p className="text-gray-700 font-medium text-center">
        Found {results.length} pages — which one?
      </p>
      <div className="w-full max-w-xs space-y-2 mt-2">
        {results.map(r => (
          <button
            key={r.id}
            onClick={() => onSelect(r.id)}
            className="w-full py-3 px-4 rounded-2xl bg-white shadow-sm text-left hover:bg-purple-50 transition-colors"
          >
            <span className="block text-purple-800 font-medium">{r.personName}</span>
            <span className="block text-xs text-gray-400 mt-0.5">
              created {new Date(r.createdAt).toLocaleDateString()}
            </span>
          </button>
        ))}
      </div>
      <button
        onClick={onBack}
        className="mt-3 text-gray-400 text-sm hover:text-gray-600 transition-colors"
      >
        ← back
      </button>
    </div>
  )
}
