import type { PropsWithChildren } from "react"
import { mono, sans } from "@/assets/fonts"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

import "./globals.css"

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(sans.variable, mono.variable)}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
