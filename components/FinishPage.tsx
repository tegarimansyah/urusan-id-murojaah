'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, Download, HomeIcon } from 'lucide-react'
import { useRecordingStore } from '@/store/useRecordingStore'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

interface FinishInterfaceProps {
  onFinish: (finish: boolean) => void
}

export default function FinishPage({onFinish}: FinishInterfaceProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlsRef = useRef<string[]>([])
  const ffmpegRef = useRef<FFmpeg | null>(null)

  const { getRecordings } = useRecordingStore()
  const recordings = getRecordings()

  useEffect(() => {
    // Create object URLs for all recordings
    audioUrlsRef.current = recordings.map(blob => URL.createObjectURL(blob))

    // Clean up function to revoke object URLs
    return () => {
      audioUrlsRef.current.forEach(url => URL.revokeObjectURL(url))
    }
  }, [recordings])

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
    }

    const audio = audioRef.current

    audio.src = audioUrlsRef.current[currentIndex]

    audio.onended = () => {
      if (currentIndex < recordings.length - 1) {
        setCurrentIndex(prevIndex => prevIndex + 1)
      } else {
        setIsPlaying(false)
        setCurrentIndex(0)
      }
    }

    if (isPlaying) {
      audio.play()
    } else {
      audio.pause()
    }

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [currentIndex, isPlaying, recordings.length])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const loadFFmpeg = async () => {
    if (ffmpegRef.current) return;
    const ffmpeg = new FFmpeg();
    await ffmpeg.load({
      coreURL: await toBlobURL(`https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.min.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm`, 'application/wasm'),
    });
    ffmpegRef.current = ffmpeg;
  };

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      await loadFFmpeg();
      const ffmpeg = ffmpegRef.current!;

      // Write all audio files
      for (let i = 0; i < recordings.length; i++) {
        const fileName = `audio${i}.webm`;
        await ffmpeg.writeFile(fileName, await fetchFile(recordings[i]));
      }

      // Create a file list for concatenation
      const fileList = recordings.map((_, i) => `file 'audio${i}.webm'`).join('\n');
      await ffmpeg.writeFile('fileList.txt', fileList);

      // Concatenate all audio files
      await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', 'fileList.txt', '-c', 'copy', 'output.webm']);

      // Read the output file
      const data = await ffmpeg.readFile('output.webm');

      // Create a download link
      const blob = new Blob([data], { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'combined_recording.webm';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error during download:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleHome = useCallback(() => {
    onFinish(false)
  }, [onFinish])

  if (recordings.length === 0) {
    return (
      <div className="flex flex-col items-center space-y-8 w-full max-w-2xl">
        <h2 className="text-3xl font-bold">No Recordings Available</h2>
        <p>There are no completed recordings to review or download.</p>
        <Button onClick={handleHome} disabled={isLoading}>
          <HomeIcon size={24} />
          Back to Home
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-8 w-full max-w-2xl">
      <h2 className="text-3xl font-bold">Recordings Complete!</h2>
      <div className="text-lg mb-4">
        Total recordings: {recordings.length}
      </div>
      <div className="flex space-x-4">
        <Button onClick={togglePlay}>
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          {isPlaying ? 'Pause' : 'Play All'}
        </Button>
        <Button onClick={handleDownload} disabled={isLoading}>
          <Download size={24} />
          {isLoading ? 'Processing...' : 'Download All'}
        </Button>
        <Button onClick={handleHome} disabled={isLoading}>
          <HomeIcon size={24} />
          Back to Home
        </Button>
      </div>
      <div className="text-lg">
        {isPlaying ? `Playing recording ${currentIndex + 1} of ${recordings.length}` : 'Ready to play'}
      </div>
    </div>
  )
}

