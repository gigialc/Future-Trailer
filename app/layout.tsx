import { type Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CldUploadWidget } from 'next-cloudinary'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Future Trailer Generator",
  description: "Generate video trailers of your future",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          src={`https://widget.cloudinary.com/v2.0/global/all.js`}
          type="text/javascript"
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
