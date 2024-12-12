'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause } from 'lucide-react'

interface AudioPlayerProps {
  audioBlob: Blob
}

export default function AudioPlayer({ audioBlob }: AudioPlayerProps) {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const audioUrl = URL.createObjectURL(audioBlob)
    const newAudio = new Audio(audioUrl)
    setAudio(newAudio)

    return () => {
      URL.revokeObjectURL(audioUrl)
    }
  }, [audioBlob])

  const togglePlay = () => {
    if (audio) {
      if (isPlaying) {
        audio.pause()
      } else {
        audio.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  useEffect(() => {
    if (audio) {
      audio.onended = () => setIsPlaying(false)
    }
  }, [audio])

  return (
    <Button onClick={togglePlay}>
      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
      {isPlaying ? 'Pause' : 'Play'}
    </Button>
  )
}

