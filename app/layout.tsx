import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Xanh_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });
const xanhMono = Xanh_Mono({ weight: "400", subsets: ["latin"], variable: "--font-xanh-mono" });

export const metadata: Metadata = {
  title: 'Demian - Where the Best Student Founders Get Discovered',
  description: 'AI-powered platform connecting student founders with venture capitalists. Upload your pitch, get AI feedback, and get discovered by top investors.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#0d0f14',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${xanhMono.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
