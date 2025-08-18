import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Doc0 - Professional Documentation Platform for Development Teams',
  description: 'Create, manage, and share professional project documentation with Doc0. Streamline your documentation workflow with our intuitive platform featuring smart templates, secure sharing, and team collaboration.',
  keywords: 'documentation platform, README generator, project docs, team collaboration, markdown editor, technical writing',
  authors: [{ name: 'Doc0 Team' }],
  creator: 'Doc0',
  publisher: 'Doc0',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://docs.pacifylabshq.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Doc0 - Professional Documentation Platform',
    description: 'Create, manage, and share professional project documentation with Doc0. Streamline your documentation workflow.',
    url: 'https://docs.pacifylabshq.com',
    siteName: 'Doc0',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Doc0 - Documentation Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Doc0 - Professional Documentation Platform',
    description: 'Create, manage, and share professional project documentation with Doc0.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
