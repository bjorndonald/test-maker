import DisplayPages from '@/components/ui/display-pages'
import Generate from '@/components/ui/generate'
import UploadPdf from '@/components/ui/upload-pdf'
import Image from 'next/image'
import Body from './body'

export default function Home() {
  return (
    <main className="flex min-h-screen gap-10 flex-col items-center justify-between p-24">
      <Body />
    </main>
  )
}
