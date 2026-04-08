import { DashboardLayout } from "@/components/dashboard-layout"
import { ServiceMonitoring } from "@/components/service-monitoring"

export default function Page() {
  return (
    <DashboardLayout>
      <ServiceMonitoring />
    </DashboardLayout>
  )
}
