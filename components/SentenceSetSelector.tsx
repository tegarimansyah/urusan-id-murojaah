import { Button } from '@/components/ui/button'

interface SentenceSetSelectorProps {
  sets: string[]
  onSelect: (set: string) => void
}

export default function SentenceSetSelector({ sets, onSelect }: SentenceSetSelectorProps) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Select a sentence set:</h2>
      {sets.map((set) => (
        <Button key={set} onClick={() => onSelect(set)} className="w-48">
          {set}
        </Button>
      ))}
    </div>
  )
}

