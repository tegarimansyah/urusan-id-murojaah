'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import CountdownTimer from './CountdownTimer'
import AudioPlayer from './AudioPlayer'
import DownloadButton from './DownloadButton'
import { useRecordingStore } from '@/store/useRecordingStore'

interface RecordingInterfaceProps {
  sentences: string[]
  onFinish: (finish: boolean) => void
}

export default function RecordingInterface({ sentences, onFinish }: RecordingInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [showCountdown, setShowCountdown] = useState(false)
  const [isFirstRecording, setIsFirstRecording] = useState(true)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const { addRecording, getRecordings } = useRecordingStore()

  const startRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      audioChunksRef.current = []
      if (isFirstRecording) {
        setShowCountdown(true)
        setTimeout(() => {
          setShowCountdown(false)
          setIsRecording(true)
          if (mediaRecorderRef.current?.state === 'inactive') { mediaRecorderRef.current?.start() }
          setIsFirstRecording(false)
        }, 3000)
      } else {
        setIsRecording(true)
        mediaRecorderRef.current.start()
      }
    }
  }, [isFirstRecording])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      setIsRecording(false)
      mediaRecorderRef.current.stop()
    }
  }, [])

  const handleNext = useCallback(() => {
    setIsFirstRecording(false)
    if (currentIndex < sentences.length - 1) {
      stopRecording()
      setCurrentIndex(prevIndex => prevIndex + 1)
    }
  }, [currentIndex, sentences.length, stopRecording])

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      stopRecording()
      setCurrentIndex(prevIndex => prevIndex - 1)
    }
  }, [currentIndex, stopRecording])

  const handleFinish = useCallback(() => {
    stopRecording()
    streamRef.current?.getTracks().forEach(track => track.stop())
    onFinish(true)
  }, [onFinish, stopRecording])

  useEffect(() => {
    if (currentIndex > 0) {
      setTimeout(() => {
        startRecording()
      }, 500)
    }
  }, [currentIndex, startRecording])

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        streamRef.current = stream
        const recorder = new MediaRecorder(stream)
        mediaRecorderRef.current = recorder

        recorder.onstart = () => {
          audioChunksRef.current = []
        }

        recorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data)
        }

        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          addRecording(currentIndex, audioBlob)
        }
      })
      .catch(error => console.error('Error accessing microphone:', error))

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [addRecording, currentIndex])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') handleNext()
      if (event.key === 'ArrowLeft') handlePrevious()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrevious])

  const recordings = getRecordings()

  return (
    <div className="flex flex-col items-center space-y-8 w-full max-w-2xl">
      <div className="text-2xl font-semibold text-center">{sentences[currentIndex]}</div>
      {isFirstRecording && showCountdown && <CountdownTimer />}
      { !showCountdown && <Button
        size="lg"
        className={`rounded-full p-8 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
        onClick={isRecording ? stopRecording : startRecording}
      >
        <Mic size={48} />
      </Button> }
      <div className="flex justify-between w-full">
        <Button onClick={handlePrevious} disabled={currentIndex === 0}>
          <ChevronLeft size={24} />
          Previous
        </Button>
        {currentIndex === sentences.length - 1 ? (
          <Button onClick={handleFinish}>
            <Check size={24} />
            Finish
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Next
            <ChevronRight size={24} />
          </Button>
        )}
      </div>
      {recordings[currentIndex] && (
        <div className="flex flex-col items-center space-y-4">
          <AudioPlayer audioBlob={recordings[currentIndex]} />
          <DownloadButton audioBlob={recordings[currentIndex]} fileName={`recording_${currentIndex + 1}.webm`} />
        </div>
      )}
    </div>
  )
}

