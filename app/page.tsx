'use client'

import { useState } from 'react'
import SentenceSetSelector from '@/components/SentenceSetSelector'
import RecordingInterface from '@/components/RecordingInterface'
import FinishPage from '@/components/FinishPage'
import { useRecordingStore } from '@/store/useRecordingStore'
import alFatihah from "@/data/quran/1.json"

const sentenceSets = {
  // set1: [
  //   "The quick brown fox jumps over the lazy dog.",
  //   "Pack my box with five dozen liquor jugs.",
  //   "How vexingly quick daft zebras jump!"
  // ],
  // set2: [
  //   "Sphinx of black quartz, judge my vow.",
  //   "Two driven jocks help fax my big quiz.",
  //   "The five boxing wizards jump quickly."
  // ],
  alFatihah,
}

export default function Home() {
  const [selectedSet, setSelectedSet] = useState<string | null>(null)
  const [isFinished, setIsFinished] = useState(false)
  const { clearRecordings } = useRecordingStore()

  const handleSetSelect = (set: string) => {
    setSelectedSet(set)
    clearRecordings()
    setIsFinished(false)
  }

  const handleFinish = (finish: boolean) => {
    setIsFinished(finish)
    if (finish === false) { setSelectedSet(null) }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Recording Web App</h1>
      {!selectedSet ? (
        <SentenceSetSelector 
          sets={Object.keys(sentenceSets)} 
          onSelect={handleSetSelect} 
        />
      ) : isFinished ? (
        <FinishPage onFinish={handleFinish} />
      ) : (
        <RecordingInterface 
          sentences={sentenceSets[selectedSet as keyof typeof sentenceSets].text} 
          onFinish={handleFinish}
        />
      )}
    </main>
  )
}

