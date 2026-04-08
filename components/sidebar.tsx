"use client"

import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

const CommissioningIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
    />
  </svg>
)

const DailyRunningIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const FuelIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v4m0 0l-4-4m4 4H10"
    />
  </svg>
)

const ServiceIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const ServiceabilityIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const InsuranceIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
)

const WorksheetIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
    />
  </svg>
)

interface SidebarProps {
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const [isFuelExpanded, setIsFuelExpanded] = useState(pathname.startsWith("/fuel-monitoring"))

  const isActive = (path: string) => pathname === path

  return (
    <>
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-sidebar-border",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-24 flex items-center justify-center border-b border-sidebar-border px-3 py-2">
          <Link href="/" onClick={onMobileClose} className="inline-flex items-center group w-full justify-center">
            <Image
              src="/images/xenvolt-logo.png"
              alt="Xenvolt"
              width={260}
              height={84}
              className="h-16 w-auto max-w-full object-contain transition-opacity group-hover:opacity-90"
              priority
            />
            <span className="sr-only">Go to Commissioning</span>
          </Link>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="px-3 space-y-1">
            <Link href="/" onClick={onMobileClose} className="block" aria-current={isActive("/") ? "page" : undefined}>
              <span
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive("/") ? "bg-accent text-accent-foreground shadow-sm" : "hover:bg-secondary/50",
                )}
              >
                <CommissioningIcon />
                <span className="font-medium">Commissioning</span>
              </span>
            </Link>

            <Link
              href="/daily-running"
              onClick={onMobileClose}
              className="block"
              aria-current={isActive("/daily-running") ? "page" : undefined}
            >
              <span
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive("/daily-running") ? "bg-accent text-accent-foreground shadow-sm" : "hover:bg-secondary/50",
                )}
              >
                <DailyRunningIcon />
                <span className="font-medium">Daily Running</span>
              </span>
            </Link>

            <div>
              <button
                onClick={() => setIsFuelExpanded(!isFuelExpanded)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  pathname.startsWith("/fuel-monitoring")
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "hover:bg-secondary/50",
                )}
              >
                <FuelIcon />
                <span className="font-medium flex-1 text-left">Fuel Monitoring</span>
                {isFuelExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              {isFuelExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  <Link
                    href="/fuel-monitoring/received"
                    onClick={onMobileClose}
                    className="block"
                    aria-current={isActive("/fuel-monitoring/received") ? "page" : undefined}
                  >
                    <span
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm",
                        isActive("/fuel-monitoring/received")
                          ? "bg-accent/80 text-accent-foreground"
                          : "hover:bg-secondary/50",
                      )}
                    >
                      <span>Received</span>
                    </span>
                  </Link>

                  <Link
                    href="/fuel-monitoring/consumption"
                    onClick={onMobileClose}
                    className="block"
                    aria-current={isActive("/fuel-monitoring/consumption") ? "page" : undefined}
                  >
                    <span
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm",
                        isActive("/fuel-monitoring/consumption")
                          ? "bg-accent/80 text-accent-foreground"
                          : "hover:bg-secondary/50",
                      )}
                    >
                      <span>Consumption</span>
                    </span>
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/service-monitoring"
              onClick={onMobileClose}
              className="block"
              aria-current={isActive("/service-monitoring") ? "page" : undefined}
            >
              <span
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive("/service-monitoring")
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "hover:bg-secondary/50",
                )}
              >
                <ServiceIcon />
                <span className="font-medium">Service Monitoring</span>
              </span>
            </Link>

            <Link
              href="/serviceability"
              onClick={onMobileClose}
              className="block"
              aria-current={isActive("/serviceability") ? "page" : undefined}
            >
              <span
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive("/serviceability") ? "bg-accent text-accent-foreground shadow-sm" : "hover:bg-secondary/50",
                )}
              >
                <ServiceabilityIcon />
                <span className="font-medium">Serviceability</span>
              </span>
            </Link>

            <Link
              href="/gsv-rto-insurance"
              onClick={onMobileClose}
              className="block"
              aria-current={isActive("/gsv-rto-insurance") ? "page" : undefined}
            >
              <span
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive("/gsv-rto-insurance")
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "hover:bg-secondary/50",
                )}
              >
                <InsuranceIcon />
                <span className="font-medium">GSV RTO & Insurance</span>
              </span>
            </Link>

            <Link
              href="/daily-worksheet"
              onClick={onMobileClose}
              className="block"
              aria-current={isActive("/daily-worksheet") ? "page" : undefined}
            >
              <span
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive("/daily-worksheet") ? "bg-accent text-accent-foreground shadow-sm" : "hover:bg-secondary/50",
                )}
              >
                <WorksheetIcon />
                <span className="font-medium">Daily Worksheet</span>
              </span>
            </Link>
          </div>
        </nav>
      </div>
    </>
  )
}
