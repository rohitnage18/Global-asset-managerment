import { DashboardLayout } from "@/components/dashboard-layout"
import { DailyWorksheet } from "@/components/daily-worksheet"

export default function Page() {
  return (
    <DashboardLayout>
      <DailyWorksheet />
    </DashboardLayout>
  )
}
