import { type Metadata, type Viewport } from "next"
import Script from "next/script"

import { fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeProvider } from "@/components/theme-provider"

import "@/styles/globals.css"

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable
          )}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="relative flex min-h-screen flex-col">
              {children}
            </div>
            <TailwindIndicator />
          </ThemeProvider>
          <Script src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js" />
          <Script id="kofi-widget" strategy="lazyOnload">
            {`
              kofiWidgetOverlay.draw('urbanismplus', {
                'type': 'floating-chat',
                'floating-chat.donateButton.text': 'Support',
                'floating-chat.donateButton.background-color': '#00b9fe',
                'floating-chat.donateButton.text-color': '#fff'
              });
            `}
          </Script>
        </body>
      </html>
    </>
  )
}
