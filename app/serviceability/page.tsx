import { DashboardLayout } from "@/components/dashboard-layout"
import { ServiceabilityReport } from "@/components/serviceability-report"

export default function Page() {
  return (
    <DashboardLayout>
      <ServiceabilityReport />
    </DashboardLayout>
  )
}
