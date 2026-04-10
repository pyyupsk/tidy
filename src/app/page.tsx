import type { Metadata } from "next"
import { TidyApp } from "@/components/tidy-app"

export const metadata: Metadata = {
  title: "tidy — clean your xlsx",
  description: "Client-side xlsx data cleaning tool",
}

export default function Page() {
  return <TidyApp />
}
