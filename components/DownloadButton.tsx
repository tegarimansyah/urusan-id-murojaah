import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface DownloadButtonProps {
  audioBlob: Blob
  fileName: string
}

export default function DownloadButton({ audioBlob, fileName }: DownloadButtonProps) {
  const handleDownload = () => {
    const url = URL.createObjectURL(audioBlob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Button onClick={handleDownload}>
      <Download size={24} />
      Download Recording
    </Button>
  )
}

