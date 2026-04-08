import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { EquipmentProvider } from "@/contexts/equipment-context"
import { FuelProvider } from "@/contexts/fuel-context"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Xenvolt - GSE Management System",
  description: "Xenvolt Ground Support Equipment Management Dashboard",
  generator: "v0.app",
  icons: {
    icon: "/images/xenvolt-favicon.png",
    shortcut: "/images/xenvolt-favicon.png",
    apple: "/images/xenvolt-favicon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="font-sans">
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>
            <EquipmentProvider>
              <FuelProvider>
                <Toaster />
                {children}
              </FuelProvider>
            </EquipmentProvider>
          </AuthProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
