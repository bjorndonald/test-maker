import { create } from "zustand";

interface AppState {
    selectedPdf: File | null
    currentId: string
    numberOfPages: number
    pdfs: string[]
    tags: string[],
    start: number
    stop: number
    canGenerate: boolean
    allowGenerate: () => void
    disallowGenerate: () => void
    setStart: (num: number) => void
    setStop: (num: number) => void
    updatePDFInfo: (id: string, pages: number, pdfs: string[]) => void
    updateEmbedInfo: (tags: string[]) => void
    selectPDF: (file: File) => void
    reset: () => void
}

const useAppStore = create<AppState>(set => ({
    selectedPdf: null,
    currentId: "",
    numberOfPages: 0,
    start: 0,
    stop: 0,
    pdfs: [],
    tags: [],
    canGenerate: false,
    setStart(num) {
        set({ start: num })
    },
    setStop(num) {
        set({ stop: num })
    },
    updateEmbedInfo(tags) {
        set({tags})
    },
    updatePDFInfo(id, pages, pdfs) {
        set({ currentId: id, numberOfPages: pages, pdfs })
    },
    selectPDF(file) {
        set({
            selectedPdf: file
        })
    },
    allowGenerate() {
        set((state)=>({
            canGenerate: true
        }))
    },
    disallowGenerate() {
        set((state) => ({
            canGenerate: false
        }))
    },
    reset() {
        set({
            canGenerate: false,
            currentId: "",
            stop: 0,
            start: 0,
            numberOfPages: 0,
            pdfs: [],
            selectedPdf: null
        })
    },
}))

export default useAppStore