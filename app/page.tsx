import { DashboardLayout } from "@/components/dashboard-layout"
import { CommissioningDashboard } from "@/components/commissioning-dashboard"

export default function HomePage() {
  return (
    <DashboardLayout>
      <CommissioningDashboard />
    </DashboardLayout>
  )
}
