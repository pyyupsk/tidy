import type { Metadata } from "next"
import type { PropsWithChildren } from "react"
import { mono, sans } from "@/assets/fonts"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import "./globals.css"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tidy.vercel.app"

const description =
  "Client-side xlsx cleaning tool. Drop columns, deduplicate rows, and fill missing values — 100% in-browser, your data never leaves your device."

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "tidy — clean your xlsx",
    template: "%s | tidy",
  },
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "tidy",
    title: "tidy — clean your xlsx",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "tidy — clean your xlsx",
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(sans.variable, mono.variable)}>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  )
}
