import type { PropsWithChildren } from "react"
import { mono, sans } from "@/assets/fonts"
import { cn } from "@/lib/utils"

import "./globals.css"

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(sans.variable, mono.variable)}>{children}</body>
    </html>
  )
}
