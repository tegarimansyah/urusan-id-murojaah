import { create } from 'zustand'

interface RecordingStore {
  recordings: Blob[]
  addRecording: (index: number, recording: Blob) => void
  getRecordings: () => Blob[]
  clearRecordings: () => void
}

export const useRecordingStore = create<RecordingStore>((set, get) => ({
  recordings: [],
  addRecording: (index: number, recording: Blob) => set(state => {
    const newRecordings = [...state.recordings]
    newRecordings[index] = recording
    return { recordings: newRecordings }
  }),
  getRecordings: () => get().recordings.filter(Boolean),
  clearRecordings: () => set({ recordings: [] })
}))

