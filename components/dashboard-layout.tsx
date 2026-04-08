"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface DashboardLayoutProps {
  children: ReactNode
}

function getPageTitle(pathname: string): string {
  const titleMap: Record<string, string> = {
    "/": "Commissioning Dashboard",
    "/daily-running": "Daily Running",
    "/fuel-monitoring": "Fuel Monitoring",
    "/fuel-monitoring/received": "Fuel Monitoring - Received",
    "/fuel-monitoring/consumption": "Fuel Monitoring - Consumption",
    "/service-monitoring": "Service Monitoring",
    "/serviceability": "Serviceability Report",
    "/gsv-rto-insurance": "GSV RTO & Insurance",
    "/daily-worksheet": "Daily Worksheet",
  }
  return titleMap[pathname] || "GFHS Dashboard"
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const pageTitle = getPageTitle(pathname)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
    }
  }, [isLoading, user, router])

  if (!isMounted || isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
        <Header onMobileSidebarToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} pageTitle={pageTitle} />
        <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6 bg-muted/30">
          <div className="w-full max-w-[1920px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
