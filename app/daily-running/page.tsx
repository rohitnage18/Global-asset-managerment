import { DashboardLayout } from "@/components/dashboard-layout"
import { DailyRunning } from "@/components/daily-running"

export default function Page() {
  return (
    <DashboardLayout>
      <DailyRunning />
    </DashboardLayout>
  )
}
