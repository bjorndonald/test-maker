import { create } from "zustand";

interface AppState {
    selectedPdf: File | null
    currentId: string
    numberOfPages: number, 
    blobs: Blob[],
    updatePDFInfo: (id: string, pages: number, blobs: Blob[]) => void
    selectPDF: (file: File) => void
    reset: () => void
}

const useAppStore = create<AppState>(set => ({
    selectedPdf: null,
    currentId: "",
    numberOfPages: 0,
    blobs: [],
    updatePDFInfo(id, pages, blobs) {
        set({currentId: id, numberOfPages: pages, blobs})
    },
    selectPDF(file) {
        set({
            selectedPdf: file
        })
    },
    reset() {
        set({
            selectedPdf: null
        })
    },
}))

export default useAppStore