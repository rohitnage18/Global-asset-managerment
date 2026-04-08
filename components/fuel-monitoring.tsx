"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { sendEmailAction } from "@/app/actions/send-email"
import { Loader2, Send, Plus } from "lucide-react"
import { useEquipment } from "@/contexts/equipment-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type FuelEntry = {
  id: string
  gseNumber: string
  station: string
  category: string
  date: string
  openingHours: number
  closingHours: number
  usedHours: number
  fuelConsumptionAvg: number | string
  topupDiesel: number | string
  receivedFuel: number | string
  topupPetrol: number | string
  perLitreCost: number | string // Added per litre cost field
  totalCost: number | string // Added total cost field
  workDoneBy?: string
  supervisedBy?: string
  remarks?: string
}

export function FuelMonitoring() {
  const { equipment } = useEquipment()
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([])
  const [sendingRow, setSendingRow] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const { toast } = useToast()

  const [newEntry, setNewEntry] = useState({
    gseNumber: "",
    date: "",
    closingHours: "",
    topupDiesel: "",
    receivedFuel: "",
    topupPetrol: "",
    perLitreCost: "", // Added per litre cost to state
    workDoneBy: "",
    supervisedBy: "",
    remarks: "",
  })

  const [requestEquipment, setRequestEquipment] = useState("")

  useEffect(() => {
    if (isAddDialogOpen && !newEntry.date) {
      const today = new Date().toISOString().split("T")[0]
      setNewEntry((prev) => ({ ...prev, date: today }))
    }
  }, [isAddDialogOpen])

  const getLastClosingHours = (gseNumber: string): number => {
    const equipmentEntries = fuelEntries
      .filter((entry) => entry.gseNumber === gseNumber)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    console.log("[v0] Finding last closing hours for", gseNumber)
    console.log("[v0] Equipment entries found:", equipmentEntries)

    if (equipmentEntries.length > 0) {
      console.log("[v0] Last closing hours:", equipmentEntries[0].closingHours)
      return equipmentEntries[0].closingHours
    }
    console.log("[v0] No previous entry, defaulting to 1")
    return 1
  }

  const selectedEquipment = equipment.find((eq) => eq.gseNumber === newEntry.gseNumber)
  const openingHours = newEntry.gseNumber ? getLastClosingHours(newEntry.gseNumber) : 1
  const usedHours = newEntry.closingHours ? Math.max(0, Number(newEntry.closingHours) - openingHours) : 0

  const fuelAmount = Number(newEntry.topupDiesel) || Number(newEntry.topupPetrol) || 0
  const fuelConsumptionAvg = fuelAmount > 0 ? (usedHours / fuelAmount).toFixed(2) : ""

  const totalCost =
    newEntry.perLitreCost && fuelAmount > 0 ? (Number(newEntry.perLitreCost) * fuelAmount).toFixed(2) : ""

  const handleAddEntry = () => {
    if (!newEntry.gseNumber || !newEntry.date || !newEntry.closingHours) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in Equipment, Date, and Closing Hours.",
        variant: "destructive",
      })
      return
    }

    const entry: FuelEntry = {
      id: Date.now().toString(),
      gseNumber: newEntry.gseNumber,
      station: selectedEquipment?.station || "",
      category: selectedEquipment?.category || "",
      date: newEntry.date,
      openingHours: openingHours,
      closingHours: Number(newEntry.closingHours),
      usedHours: usedHours,
      fuelConsumptionAvg: fuelConsumptionAvg, // Use calculated value
      topupDiesel: newEntry.topupDiesel || "",
      receivedFuel: newEntry.receivedFuel || "",
      topupPetrol: newEntry.topupPetrol || "",
      perLitreCost: newEntry.perLitreCost || "", // Added per litre cost
      totalCost: totalCost, // Added total cost
      workDoneBy: newEntry.workDoneBy,
      supervisedBy: newEntry.supervisedBy,
      remarks: newEntry.remarks,
    }

    setFuelEntries((prev) => [...prev, entry])
    setIsAddDialogOpen(false)
    setNewEntry({
      gseNumber: "",
      date: "",
      closingHours: "",
      topupDiesel: "",
      receivedFuel: "",
      topupPetrol: "",
      perLitreCost: "", // Reset per litre cost
      workDoneBy: "",
      supervisedBy: "",
      remarks: "",
    })
    toast({
      title: "✅ Fuel Data Added",
      description: `Entry for ${newEntry.gseNumber} has been added successfully.`,
      variant: "success",
    })
  }

  const exportCSV = () => {
    const header = [
      "Date",
      "Station",
      "Equipment ID",
      "Category",
      "Opening Hours",
      "Closing Hours",
      "Uses Hours",
      "Fuel Consumption Avg",
      "Top uped Diesel",
      "Received Diesel/Petrol from Vendor",
      "Top uped Petrol",
      "Per Litre Cost", // Added to CSV export
      "Total Cost", // Added to CSV export
      "Work Done By",
      "Supervised By",
      "Remark",
    ].join(",")
    const lines = fuelEntries
      .map((r) =>
        [
          r.date,
          r.station,
          r.gseNumber,
          r.category,
          r.openingHours,
          r.closingHours,
          r.usedHours,
          r.fuelConsumptionAvg,
          r.topupDiesel,
          r.receivedFuel,
          r.topupPetrol,
          r.perLitreCost, // Added to CSV export
          r.totalCost, // Added to CSV export
          r.workDoneBy || "",
          r.supervisedBy || "",
          `"${r.remarks || ""}"`,
        ].join(","),
      )
      .join("\n")
    const blob = new Blob([header + "\n" + lines], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "fuel-monitoring.csv"
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: "Exported CSV", description: `Rows: ${fuelEntries.length}` })
  }

  const exportPDF = () => {
    const w = window.open("", "_blank")
    if (!w) return
    w.document.write(`<html><head><title>Fueling Monitoring Report</title>
      <style>
        body{font-family:Arial;margin:20px}
        h2{text-align:center;margin-bottom:20px}
        table{width:100%;border-collapse:collapse;font-size:10px}
        th,td{border:1px solid #000;padding:4px;text-align:center}
        th{background:#f0f0f0;font-weight:bold}
      </style>
    </head><body>
      <h2>Fueling Monitoring Report</h2>
      <table>
        <thead>
          <tr>
            <th>DATE</th>
            <th>STATION</th>
            <th>EQUIPMENT ID</th>
            <th>Category (Type of Equipment)</th>
            <th>Opening hours</th>
            <th>closing hours</th>
            <th>Uses hours</th>
            <th>Fuel consumption average</th>
            <th>Top uped Diesel</th>
            <th>Received diesel/Petrol from vendor</th>
            <th>Top uped Petrol</th>
            <th>Per Litre Cost</th>
            <th>Total Cost</th>
            <th>work done by</th>
            <th>suprvisored by</th>
            <th>Remark</th>
          </tr>
        </thead>
        <tbody>
          ${fuelEntries
            .map(
              (r) => `<tr>
            <td>${r.date || ""}</td>
            <td>${r.station}</td>
            <td>${r.gseNumber}</td>
            <td>${r.category}</td>
            <td>${r.openingHours}</td>
            <td>${r.closingHours}</td>
            <td>${r.usedHours}</td>
            <td>${r.fuelConsumptionAvg}</td>
            <td>${r.topupDiesel}</td>
            <td>${r.receivedFuel}</td>
            <td>${r.topupPetrol}</td>
            <td>${r.perLitreCost}</td>
            <td>${r.totalCost}</td>
            <td>${r.workDoneBy || ""}</td>
            <td>${r.supervisedBy || ""}</td>
            <td>${r.remarks || ""}</td>
          </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </body></html>`)
    w.document.close()
    w.print()
    w.close()
  }

  const handleRequestFuel = async () => {
    if (!requestEquipment) {
      toast({
        title: "No Equipment Selected",
        description: "Please select an equipment to request fuel.",
        variant: "destructive",
      })
      return
    }

    const eq = equipment.find((e) => e.gseNumber === requestEquipment)
    if (!eq) return

    const latestEntry = fuelEntries
      .filter((entry) => entry.gseNumber === requestEquipment)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    setSendingRow(requestEquipment)
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
    .header p { margin: 5px 0 0 0; opacity: 0.9; }
    .content { background: white; padding: 30px 20px; border: 1px solid #e5e7eb; border-top: none; }
    .info-box { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 15px 0; border-radius: 4px; }
    .detail-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .detail-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
    .detail-table td:first-child { font-weight: 600; color: #6b7280; width: 40%; }
    .detail-table td:last-child { color: #111827; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
    .footer p { margin: 5px 0; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⛽ Fuel Request</h1>
      <p>GFHS Fuel Management System</p>
    </div>
    <div class="content">
      <div class="info-box">
        <strong>📍 Equipment Details</strong>
      </div>
      <table class="detail-table">
        <tr><td>Station</td><td><strong>${eq.station}</strong></td></tr>
        <tr><td>Equipment ID</td><td><strong>${eq.gseNumber}</strong></td></tr>
        <tr><td>Category</td><td>${eq.category}</td></tr>
        <tr><td>Date</td><td>${latestEntry?.date || "N/A"}</td></tr>
      </table>
      ${
        latestEntry
          ? `
      <div class="info-box">
        <strong>⏱️ Operating Hours</strong>
      </div>
      <table class="detail-table">
        <tr><td>Opening Hours</td><td>${latestEntry.openingHours} hrs</td></tr>
        <tr><td>Closing Hours</td><td>${latestEntry.closingHours} hrs</td></tr>
        <tr><td>Hours Used</td><td><strong>${latestEntry.usedHours} hrs</strong></td></tr>
        <tr><td>Fuel Consumption Avg</td><td>${latestEntry.fuelConsumptionAvg || "N/A"}</td></tr>
      </table>
      <div class="info-box">
        <strong>⛽ Fuel Request Details</strong>
      </div>
      <table class="detail-table">
        <tr><td>Top uped Diesel</td><td><strong>${latestEntry.topupDiesel || "N/A"}</strong></td></tr>
        <tr><td>Received Fuel from Vendor</td><td>${latestEntry.receivedFuel || "N/A"}</td></tr>
        <tr><td>Top uped Petrol</td><td><strong>${latestEntry.topupPetrol || "N/A"}</strong></td></tr>
      </table>
      ${
        latestEntry.workDoneBy || latestEntry.supervisedBy || latestEntry.remarks
          ? `
      <div class="info-box">
        <strong>📝 Additional Information</strong>
      </div>
      <table class="detail-table">
        ${latestEntry.workDoneBy ? `<tr><td>Work Done By</td><td>${latestEntry.workDoneBy}</td></tr>` : ""}
        ${latestEntry.supervisedBy ? `<tr><td>Supervised By</td><td>${latestEntry.supervisedBy}</td></tr>` : ""}
        ${latestEntry.remarks ? `<tr><td>Remarks</td><td>${latestEntry.remarks}</td></tr>` : ""}
      </table>
      `
          : ""
      }
      `
          : ""
      }
      <p style="margin-top: 20px; padding: 15px; background: #fffbeb; border-radius: 6px; border-left: 4px solid #f59e0b;">
        <strong>Action Required:</strong> Please arrange fuel delivery for the above equipment at the earliest.
      </p>
    </div>
    <div class="footer">
      <p><strong>GFHS Fuel Management</strong></p>
      <p>This is an automated request from your dashboard system</p>
      <p style="font-size: 12px; color: #9ca3af;">Generated on ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
    </div>
  </div>
</body>
</html>`

      const plainText = `FUEL REQUEST - GFHS

Equipment Details:
Station: ${eq.station}
Equipment ID: ${eq.gseNumber}
Category: ${eq.category}
Date: ${latestEntry?.date || "N/A"}

${
  latestEntry
    ? `Operating Hours:
Opening: ${latestEntry.openingHours} hrs
Closing: ${latestEntry.closingHours} hrs
Used: ${latestEntry.usedHours} hrs
Fuel Consumption Avg: ${latestEntry.fuelConsumptionAvg || "N/A"}

Fuel Request:
Top uped Diesel: ${latestEntry.topupDiesel || "N/A"}
Received Fuel from Vendor: ${latestEntry.receivedFuel || "N/A"}
Top uped Petrol: ${latestEntry.topupPetrol || "N/A"}

${latestEntry.workDoneBy ? `Work Done By: ${latestEntry.workDoneBy}` : ""}
${latestEntry.supervisedBy ? `Supervised By: ${latestEntry.supervisedBy}` : ""}
${latestEntry.remarks ? `Remarks: ${latestEntry.remarks}` : ""}`
    : ""
}

Action Required: Please arrange fuel delivery for the above equipment.

Generated: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
GFHS Fuel Management System`

      const result = await sendEmailAction({
        subject: `⛽ Fuel Request: ${eq.station} - ${eq.gseNumber} - GFHS`,
        text: plainText,
        html: htmlContent,
      })
      if (!result.ok) throw new Error(result.error || "Failed to send")
      toast({
        title: "✅ Request Sent Successfully",
        description: `Fuel request for ${eq.gseNumber} has been emailed to the concerned team.`,
        variant: "success",
        duration: 5000,
      })
      setIsRequestDialogOpen(false)
      setRequestEquipment("")
    } catch (e: any) {
      toast({
        title: "❌ Failed to Send Request",
        description: e.message || "Please try again later.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setSendingRow(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white rounded-lg px-6 py-4 shadow-sm">
        <h2 className="text-xl font-bold text-center flex-1">Fueling Monitoring Report</h2>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                <Plus className="h-4 w-4" />
                Add Fuel Data
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Fuel Data</DialogTitle>
                <DialogDescription>Add new fuel monitoring entry for equipment</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="equipment">Equipment *</Label>
                  <Select
                    value={newEntry.gseNumber}
                    onValueChange={(value) => setNewEntry({ ...newEntry, gseNumber: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipment.map((eq) => (
                        <SelectItem key={eq.gseNumber} value={eq.gseNumber}>
                          {eq.gseNumber} - {eq.station}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedEquipment && (
                  <div className="grid gap-2">
                    <Label>Station</Label>
                    <Input value={selectedEquipment.station} disabled className="bg-muted" />
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">Auto-populated with today's date</p>
                </div>
                <div className="grid gap-2">
                  <Label>Opening Hours (Auto-calculated)</Label>
                  <Input value={openingHours} disabled className="bg-muted" />
                  <p className="text-sm text-muted-foreground">
                    {newEntry.gseNumber
                      ? fuelEntries.filter((e) => e.gseNumber === newEntry.gseNumber).length > 0
                        ? "From last entry's closing hours"
                        : "No previous entry, defaulting to 1"
                      : "Select equipment first"}
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="closingHours">Closing Hours *</Label>
                  <Input
                    id="closingHours"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Enter closing hours"
                    value={newEntry.closingHours}
                    onChange={(e) => setNewEntry({ ...newEntry, closingHours: e.target.value })}
                  />
                </div>
                {newEntry.closingHours && (
                  <div className="grid gap-2">
                    <Label>Used Hours (Auto-calculated)</Label>
                    <Input value={usedHours.toFixed(1)} disabled className="bg-muted" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="topupDiesel">Top uped Diesel (Litres)</Label>
                    <Input
                      id="topupDiesel"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Enter litres"
                      value={newEntry.topupDiesel}
                      onChange={(e) => setNewEntry({ ...newEntry, topupDiesel: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="topupPetrol">Top uped Petrol (Litres)</Label>
                    <Input
                      id="topupPetrol"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Enter litres"
                      value={newEntry.topupPetrol}
                      onChange={(e) => setNewEntry({ ...newEntry, topupPetrol: e.target.value })}
                    />
                  </div>
                </div>

                {fuelConsumptionAvg && (
                  <div className="grid gap-2">
                    <Label>Fuel Consumption Average (Auto-calculated)</Label>
                    <Input value={`${fuelConsumptionAvg} hrs/litre`} disabled className="bg-muted" />
                    <p className="text-sm text-muted-foreground">Calculated as: Used Hours ÷ Fuel Topped Up</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="perLitreCost">Per Litre Cost (₹)</Label>
                    <Input
                      id="perLitreCost"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter cost per litre"
                      value={newEntry.perLitreCost}
                      onChange={(e) => setNewEntry({ ...newEntry, perLitreCost: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Total Cost (Auto-calculated)</Label>
                    <Input
                      value={totalCost ? `₹${totalCost}` : ""}
                      disabled
                      className="bg-muted"
                      placeholder="Will calculate automatically"
                    />
                    {totalCost && (
                      <p className="text-sm text-muted-foreground">
                        ₹{newEntry.perLitreCost} × {fuelAmount}L = ₹{totalCost}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="receivedFuel">Received Diesel/Petrol from Vendor (Litres)</Label>
                  <Input
                    id="receivedFuel"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Enter litres"
                    value={newEntry.receivedFuel}
                    onChange={(e) => setNewEntry({ ...newEntry, receivedFuel: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="workDoneBy">Work Done By</Label>
                    <Input
                      id="workDoneBy"
                      placeholder="Enter name"
                      value={newEntry.workDoneBy}
                      onChange={(e) => setNewEntry({ ...newEntry, workDoneBy: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="supervisedBy">Supervised By</Label>
                    <Input
                      id="supervisedBy"
                      placeholder="Enter name"
                      value={newEntry.supervisedBy}
                      onChange={(e) => setNewEntry({ ...newEntry, supervisedBy: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Input
                    id="remarks"
                    placeholder="Enter remarks"
                    value={newEntry.remarks}
                    onChange={(e) => setNewEntry({ ...newEntry, remarks: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEntry}>Add Entry</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                <Send className="h-4 w-4" />
                Request Fuel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Fuel</DialogTitle>
                <DialogDescription>Select equipment to send fuel request email</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="requestEquipment">Equipment *</Label>
                  <Select value={requestEquipment} onValueChange={setRequestEquipment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipment.map((eq) => (
                        <SelectItem key={eq.gseNumber} value={eq.gseNumber}>
                          {eq.gseNumber} - {eq.station}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRequestFuel} disabled={sendingRow !== null}>
                  {sendingRow ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Request"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button onClick={exportCSV} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Export CSV
          </Button>
          <Button onClick={exportPDF} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Export PDF
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 border-b-2 border-border">
                <TableHead className="font-bold text-center border-r border-border">DATE</TableHead>
                <TableHead className="font-bold text-center border-r border-border">STATION</TableHead>
                <TableHead className="font-bold text-center border-r border-border">EQUIPMENT ID</TableHead>
                <TableHead className="font-bold text-center border-r border-border">
                  Category (Type of Equipment)
                </TableHead>
                <TableHead className="font-bold text-center border-r border-border">Opening hours</TableHead>
                <TableHead className="font-bold text-center border-r border-border">closing hours</TableHead>
                <TableHead className="font-bold text-center border-r border-border">Uses hours</TableHead>
                <TableHead className="font-bold text-center border-r border-border">Fuel consumption average</TableHead>
                <TableHead className="font-bold text-center border-r border-border">Top uped Diesel</TableHead>
                <TableHead className="font-bold text-center border-r border-border">
                  Received diesel/Petrol from vendor
                </TableHead>
                <TableHead className="font-bold text-center border-r border-border">Top uped Petrol</TableHead>
                <TableHead className="font-bold text-center border-r border-border">Per Litre Cost</TableHead>
                <TableHead className="font-bold text-center border-r border-border">Total Cost</TableHead>
                <TableHead className="font-bold text-center border-r border-border">work done by</TableHead>
                <TableHead className="font-bold text-center border-r border-border">suprvisored by</TableHead>
                <TableHead className="font-bold text-center">Remark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fuelEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={16} className="text-center py-8 text-muted-foreground">
                    No fuel data entries yet. Click "Add Fuel Data" to add your first entry.
                  </TableCell>
                </TableRow>
              ) : (
                fuelEntries.map((entry) => (
                  <TableRow key={entry.id} className="border-b border-border">
                    <TableCell className="text-center border-r border-border">{entry.date}</TableCell>
                    <TableCell className="font-medium text-center border-r border-border">{entry.station}</TableCell>
                    <TableCell className="font-mono text-sm text-center border-r border-border">
                      {entry.gseNumber}
                    </TableCell>
                    <TableCell className="text-center border-r border-border">{entry.category}</TableCell>
                    <TableCell className="text-center border-r border-border">{entry.openingHours}</TableCell>
                    <TableCell className="text-center border-r border-border">{entry.closingHours}</TableCell>
                    <TableCell className="font-semibold text-center border-r border-border">
                      {entry.usedHours}
                    </TableCell>
                    <TableCell className="text-center border-r border-border">{entry.fuelConsumptionAvg}</TableCell>
                    <TableCell className="text-center border-r border-border">{entry.topupDiesel}</TableCell>
                    <TableCell className="text-center border-r border-border">{entry.receivedFuel}</TableCell>
                    <TableCell className="text-center border-r border-border">{entry.topupPetrol}</TableCell>
                    <TableCell className="text-center border-r border-border">
                      {entry.perLitreCost ? `₹${entry.perLitreCost}` : "-"}
                    </TableCell>
                    <TableCell className="text-center border-r border-border font-semibold">
                      {entry.totalCost ? `₹${entry.totalCost}` : "-"}
                    </TableCell>
                    <TableCell className="text-center border-r border-border">{entry.workDoneBy || "-"}</TableCell>
                    <TableCell className="text-center border-r border-border">{entry.supervisedBy || "-"}</TableCell>
                    <TableCell className="text-center">{entry.remarks || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
