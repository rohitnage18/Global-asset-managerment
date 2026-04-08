"use client"

import { useMemo, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { sendEmailAction } from "@/app/actions/send-email"
import { useEquipment } from "@/contexts/equipment-context"
import { Download, FileText, Pencil } from "lucide-react"
import { exportPDF as exportRowsToPDF } from "@/components/shared/export-utils"

type InsuranceData = {
  gseNumber: string
  owner: string
  department: string
  assetCode: string
  assetType: string
  assetDescription: string
  registrationNo: string
  fuelType: string
  chassisNo: string
  engineNo: string
  mfy: string
  registrationCategory: string
  seating: string
  insuranceValidityDd: string
  status: string
  policyNo: string
  fc: string
  roadTax: string
  roadPermit: string
  avp: string
  remarks: string
}

const getRowColor = (gseNumber: string) => {
  if (gseNumber.includes("/GPU/")) return "bg-orange-100"
  if (gseNumber.includes("/ACU/")) return "bg-white"
  if (gseNumber.includes("/PCB/")) return "bg-red-100"
  if (gseNumber.includes("/PBT/")) return "bg-yellow-100"
  if (gseNumber.includes("/E-TUG/") || gseNumber.includes("/ETUG/")) return "bg-blue-100"
  if (gseNumber.includes("/CAR/")) return "bg-blue-50"
  return "bg-white"
}

const GsvRtoInsurance = () => {
  const { equipment } = useEquipment()
  const [insuranceData, setInsuranceData] = useState<Record<string, InsuranceData>>({})
  const [isSending, setIsSending] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<InsuranceData | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const dummyData: Record<string, InsuranceData> = {
      "GFHS/PAT/GPU/01": {
        gseNumber: "GFHS/PAT/GPU/01",
        owner: "GFHS LTD",
        department: "GROUND SERVICES",
        assetCode: "GPU001",
        assetType: "COACH",
        assetDescription: "GROUND POWER UNIT GPU - AC/DC",
        registrationNo: "AP31TH1442",
        fuelType: "DIESEL",
        chassisNo: "MBHC2GANR6671",
        engineNo: "NAH6546D",
        mfy: "2010",
        registrationCategory: "Commercial",
        seating: "22",
        insuranceValidityDd: "2026-03-31",
        status: "ACTIVE",
        policyNo: "280300312SPDI0160760",
        fc: "2025-11-03",
        roadTax: "2026-03-31",
        roadPermit: "2026-03-31",
        avp: "2026-01-03",
        remarks: "",
      },
      "GFHS/PAT/ACU/01": {
        gseNumber: "GFHS/PAT/ACU/01",
        owner: "GFHS LTD",
        department: "GROUND SERVICES",
        assetCode: "ACU001",
        assetType: "COACH",
        assetDescription: "AIR CONDITIONING UNIT-ACU",
        registrationNo: "AP31TH1437",
        fuelType: "DIESEL",
        chassisNo: "MBHC2GANR6670",
        engineNo: "NAH6546D",
        mfy: "2010",
        registrationCategory: "Commercial",
        seating: "22",
        insuranceValidityDd: "2026-03-31",
        status: "ACTIVE",
        policyNo: "280300312SPDI0160765",
        fc: "2025-11-03",
        roadTax: "2026-03-31",
        roadPermit: "2026-03-31",
        avp: "2026-01-03",
        remarks: "",
      },
      "GFHS/PAT/PCB/01": {
        gseNumber: "GFHS/PAT/PCB/01",
        owner: "GFHS LTD",
        department: "GROUND SERVICES",
        assetCode: "PCB001",
        assetType: "COACH",
        assetDescription: "ASHOK LEYLAND COACH",
        registrationNo: "T72239",
        fuelType: "DIESEL",
        chassisNo: "N/A",
        engineNo: "N/A",
        mfy: "2022",
        registrationCategory: "Equipment",
        seating: "3",
        insuranceValidityDd: "2025-09-07",
        status: "ACTIVE",
        policyNo: "19216.00401.23.10152-00-000",
        fc: "2026-03-31",
        roadTax: "N/A",
        roadPermit: "N/A",
        avp: "2025-09-07",
        remarks: "",
      },
    }

    const newData: Record<string, InsuranceData> = {}
    equipment.forEach((eq) => {
      if (!insuranceData[eq.gseNumber]) {
        newData[eq.gseNumber] = dummyData[eq.gseNumber] || {
          gseNumber: eq.gseNumber,
          owner: "GFHS LTD",
          department: "GROUND SERVICES",
          assetCode: "",
          assetType: "COACH",
          assetDescription: "",
          registrationNo: "",
          fuelType: "DIESEL",
          chassisNo: "",
          engineNo: "",
          mfy: "2010",
          registrationCategory: "Commercial",
          seating: "",
          insuranceValidityDd: "",
          status: "ACTIVE",
          policyNo: "",
          fc: "",
          roadTax: "",
          roadPermit: "",
          avp: "",
          remarks: "",
        }
      }
    })
    if (Object.keys(newData).length > 0) {
      setInsuranceData((prev) => ({ ...prev, ...newData }))
    }
  }, [equipment])

  const rows = useMemo(() => {
    return equipment.map((eq, index) => {
      const data = insuranceData[eq.gseNumber] || {
        gseNumber: eq.gseNumber,
        owner: "",
        department: "GROUND SERVICES",
        assetCode: "",
        assetType: "COACH",
        assetDescription: "",
        registrationNo: "",
        fuelType: "DIESEL",
        chassisNo: "",
        engineNo: "",
        mfy: "2010",
        registrationCategory: "Commercial",
        seating: "",
        insuranceValidityDd: "",
        status: "ACTIVE",
        policyNo: "",
        fc: "",
        roadTax: "",
        roadPermit: "",
        avp: "",
        remarks: "",
      }
      return {
        slNo: index + 1,
        ...eq,
        ...data,
      }
    })
  }, [equipment, insuranceData])

  const updateInsuranceData = (gseNumber: string, updates: Partial<InsuranceData>) => {
    setInsuranceData((prev) => ({
      ...prev,
      [gseNumber]: { ...prev[gseNumber], ...updates },
    }))
  }

  const exportToCSV = () => {
    const headers = [
      "S.No",
      "STATION",
      "OWNER",
      "DEPARTMENT",
      "ASSET_CODE",
      "ASSET_TYPE",
      "ASSET_DESCRIPTION",
      "REGISTRATION_NO",
      "FUEL_TYPE",
      "CHASSIS_NO",
      "ENGINE_NO",
      "MFY",
      "REGISTRATION_CATEGORY",
      "SEATING",
      "INSURANCE_VALIDITY_DD",
      "STATUS",
      "Policy No.",
      "FC",
      "ROAD TAX",
      "ROAD PERMIT",
      "AVP",
      "REMARKS",
    ]
    const csvContent = [
      headers.join(","),
      ...rows.map((r) =>
        [
          r.slNo,
          r.station,
          r.owner,
          r.department,
          r.assetCode,
          r.assetType,
          r.assetDescription,
          r.registrationNo,
          r.fuelType,
          r.chassisNo,
          r.engineNo,
          r.mfy,
          r.registrationCategory,
          r.seating,
          r.insuranceValidityDd,
          r.status,
          r.policyNo,
          r.fc,
          r.roadTax,
          r.roadPermit,
          r.avp,
          r.remarks,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `gsv-rto-insurance-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: "Export successful", description: "CSV file has been downloaded." })
  }

  const exportToPDF = () => {
    if (rows.length === 0) {
      toast({ title: "No data", description: "No records available for PDF export.", variant: "destructive" })
      return
    }
    exportRowsToPDF(`gsv-rto-insurance-${new Date().toISOString().split("T")[0]}`, rows)
    toast({ title: "Export successful", description: "PDF file has been downloaded." })
  }

  const openEditDialog = (row: any) => {
    setEditingRow({
      gseNumber: row.gseNumber,
      owner: row.owner,
      department: row.department,
      assetCode: row.assetCode,
      assetType: row.assetType,
      assetDescription: row.assetDescription,
      registrationNo: row.registrationNo,
      fuelType: row.fuelType,
      chassisNo: row.chassisNo,
      engineNo: row.engineNo,
      mfy: row.mfy,
      registrationCategory: row.registrationCategory,
      seating: row.seating,
      insuranceValidityDd: row.insuranceValidityDd,
      status: row.status,
      policyNo: row.policyNo,
      fc: row.fc,
      roadTax: row.roadTax,
      roadPermit: row.roadPermit,
      avp: row.avp,
      remarks: row.remarks,
    })
    setEditDialogOpen(true)
  }

  const saveEditedData = () => {
    if (editingRow) {
      updateInsuranceData(editingRow.gseNumber, editingRow)
      toast({
        title: "✅ Data Updated",
        description: "Insurance data updated successfully.",
        variant: "success",
      })
      setEditDialogOpen(false)
      setEditingRow(null)
    }
  }

  const sendAlerts = async () => {
    setIsSending(true)
    const toAlert = rows.filter((r) => {
      const insuranceAlert = r.insuranceValidityDd
        ? Math.ceil((new Date(r.insuranceValidityDd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 30
        : false
      const fcAlert = r.fc ? Math.ceil((new Date(r.fc).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 30 : false
      return insuranceAlert || fcAlert
    })

    if (toAlert.length === 0) {
      toast({ title: "No alerts", description: "No insurance or FC expiring within 30 days." })
      setIsSending(false)
      return
    }

    try {
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: white; padding: 30px 20px; border: 1px solid #e5e7eb; }
    .alert-item { background: #fef2f2; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #dc2626; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Insurance & FC Expiry Alert</h1>
      <p>GFHS Asset Management System</p>
    </div>
    <div class="content">
      ${toAlert
        .map((r) => {
          const insuranceDays = r.insuranceValidityDd
            ? Math.ceil((new Date(r.insuranceValidityDd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : null
          const fcDays = r.fc ? Math.ceil((new Date(r.fc).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
          return `
        <div class="alert-item">
          <h3>${r.registrationNo || r.gseNumber}</h3>
          <p><strong>Station:</strong> ${r.station}</p>
          ${insuranceDays !== null && insuranceDays <= 30 ? `<p><strong>Insurance Expiry:</strong> ${r.insuranceValidityDd} (${insuranceDays} days left)</p>` : ""}
          ${fcDays !== null && fcDays <= 30 ? `<p><strong>FC Expiry:</strong> ${r.fc} (${fcDays} days left)</p>` : ""}
        </div>
      `
        })
        .join("")}
    </div>
    <div class="footer">
      <p><strong>GFHS Asset Management</strong></p>
      <p>Generated on ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
    </div>
  </div>
</body>
</html>`

      const result = await sendEmailAction({
        subject: `⚠️ Insurance & FC Expiry Alert: ${toAlert.length} Asset${toAlert.length > 1 ? "s" : ""} - GFHS`,
        html: htmlContent,
        text: `Insurance or FC expiring soon for ${toAlert.length} assets.`,
      })

      if (!result.ok) throw new Error(result.error || "Failed to send")
      toast({
        title: "✅ Alerts Sent Successfully",
        description: `Insurance & FC expiry alerts sent for ${toAlert.length} asset${toAlert.length > 1 ? "s" : ""} to the concerned team.`,
        variant: "success",
        duration: 5000,
      })
    } catch (e: any) {
      toast({
        title: "❌ Email Failed",
        description: e.message || "Failed to send alerts. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white rounded-lg px-4 sm:px-6 py-4 shadow-sm">
        <h3 className="text-lg font-semibold">GSV RTO & Insurance</h3>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button onClick={exportToCSV} variant="outline" size="sm" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={exportToPDF} variant="outline" size="sm" className="gap-2 bg-transparent">
            <FileText className="h-4 w-4" />
            Export PDF
          </Button>
          {/* <Button
            onClick={sendAlerts}
            disabled={isSending}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSending ? "Sending..." : "Check & Send Alerts"}
          </Button> */}
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 border-b-2">
                <TableHead className="text-center font-bold border-r">S.No</TableHead>
                <TableHead className="text-center font-bold border-r">STATION</TableHead>
                <TableHead className="text-center font-bold border-r">OWNER</TableHead>
                <TableHead className="text-center font-bold border-r">DEPARTMENT</TableHead>
                <TableHead className="text-center font-bold border-r">ASSET_CODE</TableHead>
                <TableHead className="text-center font-bold border-r">ASSET_TYPE</TableHead>
                <TableHead className="text-center font-bold border-r">ASSET_DESCRIPTION</TableHead>
                <TableHead className="text-center font-bold border-r">REGISTRATION_NO</TableHead>
                <TableHead className="text-center font-bold border-r">FUEL_TYPE</TableHead>
                <TableHead className="text-center font-bold border-r">CHASSIS_NO</TableHead>
                <TableHead className="text-center font-bold border-r">ENGINE_NO</TableHead>
                <TableHead className="text-center font-bold border-r">MFY</TableHead>
                <TableHead className="text-center font-bold border-r">REGISTRATION_CATEGORY</TableHead>
                <TableHead className="text-center font-bold border-r">SEATING</TableHead>
                <TableHead className="text-center font-bold border-r">INSURANCE_VALIDITY_DD</TableHead>
                <TableHead className="text-center font-bold border-r">STATUS</TableHead>
                <TableHead className="text-center font-bold border-r">Policy No.</TableHead>
                <TableHead className="text-center font-bold border-r">FC</TableHead>
                <TableHead className="text-center font-bold border-r">ROAD TAX</TableHead>
                <TableHead className="text-center font-bold border-r">ROAD PERMIT</TableHead>
                <TableHead className="text-center font-bold border-r">AVP</TableHead>
                <TableHead className="text-center font-bold border-r">REMARKS</TableHead>
                <TableHead className="text-center font-bold">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.gseNumber} className={`${getRowColor(r.gseNumber)} border-b`}>
                  <TableCell className="text-center border-r font-medium">{r.slNo}</TableCell>
                  <TableCell className="text-center border-r font-medium">{r.station}</TableCell>
                  <TableCell className="text-center border-r">{r.owner || "-"}</TableCell>
                  <TableCell className="text-center border-r">{r.department}</TableCell>
                  <TableCell className="text-center border-r">{r.assetCode || "-"}</TableCell>
                  <TableCell className="text-center border-r">{r.assetType}</TableCell>
                  <TableCell className="text-center border-r">{r.assetDescription || "-"}</TableCell>
                  <TableCell className="text-center border-r">{r.registrationNo || "-"}</TableCell>
                  <TableCell className="text-center border-r">{r.fuelType}</TableCell>
                  <TableCell className="text-center border-r">{r.chassisNo || "-"}</TableCell>
                  <TableCell className="text-center border-r">{r.engineNo || "-"}</TableCell>
                  <TableCell className="text-center border-r">{r.mfy}</TableCell>
                  <TableCell className="text-center border-r">{r.registrationCategory}</TableCell>
                  <TableCell className="text-center border-r">{r.seating || "-"}</TableCell>
                  <TableCell className="text-center border-r">{r.insuranceValidityDd || "-"}</TableCell>
                  <TableCell className="text-center border-r font-medium">{r.status}</TableCell>
                  <TableCell className="text-center border-r">{r.policyNo || "-"}</TableCell>
                  <TableCell className="text-center border-r">{r.fc || "-"}</TableCell>
                  <TableCell className="text-center border-r">{r.roadTax || "-"}</TableCell>
                  <TableCell className="text-center border-r">{r.roadPermit || "-"}</TableCell>
                  <TableCell className="text-center border-r">{r.avp || "-"}</TableCell>
                  <TableCell className="text-center border-r">{r.remarks || "-"}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(r)} className="h-8 w-8 p-0">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Insurance & RTO Details</DialogTitle>
          </DialogHeader>
          {editingRow && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Equipment ID</Label>
                  <Input value={editingRow.gseNumber} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Insurance Validity Date*</Label>
                  <Input
                    type="date"
                    value={editingRow.insuranceValidityDd}
                    onChange={(e) => setEditingRow({ ...editingRow, insuranceValidityDd: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status*</Label>
                  <Select
                    value={editingRow.status}
                    onValueChange={(val) => setEditingRow({ ...editingRow, status: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                      <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Policy No.</Label>
                  <Input
                    value={editingRow.policyNo}
                    onChange={(e) => setEditingRow({ ...editingRow, policyNo: e.target.value })}
                    placeholder="Enter policy number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>FC (Fitness Certificate)*</Label>
                  <Input
                    type="date"
                    value={editingRow.fc}
                    onChange={(e) => setEditingRow({ ...editingRow, fc: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Road Tax</Label>
                  <Input
                    type="date"
                    value={editingRow.roadTax}
                    onChange={(e) => setEditingRow({ ...editingRow, roadTax: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Road Permit</Label>
                  <Input
                    type="date"
                    value={editingRow.roadPermit}
                    onChange={(e) => setEditingRow({ ...editingRow, roadPermit: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>AVP</Label>
                  <Input
                    type="date"
                    value={editingRow.avp}
                    onChange={(e) => setEditingRow({ ...editingRow, avp: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Remarks</Label>
                <Input
                  value={editingRow.remarks}
                  onChange={(e) => setEditingRow({ ...editingRow, remarks: e.target.value })}
                  placeholder="Enter remarks"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveEditedData}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { GsvRtoInsurance }
export default GsvRtoInsurance
