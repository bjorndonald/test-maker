import { createMetadata } from '@/utils/metadata'
import './../styles/globals.scss'
import { Inter } from 'next/font/google'
import { Meta } from './meta';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  ...createMetadata({
    title: "Quick Test maker",
    description:
      "Upload files and generate tests from the documents to help studying",

    keywords: ["translations", "community", "efik", "translate", "web"],
  }),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Meta />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
