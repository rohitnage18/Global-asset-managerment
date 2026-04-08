"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { useEquipment } from "@/contexts/equipment-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileText, Plus } from "lucide-react"
import { exportPDF as exportRowsToPDF } from "@/components/shared/export-utils"
import { useAuth } from "@/contexts/auth-context"

type ServiceEntry = {
  id: string
  gseNumber: string
  station: string
  serviceDone: string
  serviceDue: string
  dateDone: string
  dateDue: string
  dateCurrent: string
  datePending: number // Changed to number for days calculation
  hrsDone: number
  hrsDue: number
  hrsCurrent: number
  hrsPending: number
  kmsDone: number
  kmsDue: number
  kmsCurrent: number
  kmsPending: number
  remarks: string
}

// Helper to get row color based on equipment type
function getRowColor(gseNumber: string): string {
  if (gseNumber.includes("/GPU/")) return "bg-orange-100"
  if (gseNumber.includes("/ACU/")) return "bg-white"
  if (gseNumber.includes("/ASU/")) return "bg-green-100"
  if (gseNumber.includes("/PBT/")) return "bg-yellow-100"
  if (gseNumber.includes("/PCB/")) return "bg-red-100"
  if (gseNumber.includes("/EBT/")) return "bg-blue-100"
  return "bg-white"
}

function calculateDaysDifference(currentDate: string, dueDate: string): number {
  if (!currentDate || !dueDate) return 0
  const current = new Date(currentDate)
  const due = new Date(dueDate)
  const diffTime = current.getTime() - due.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export function ServiceMonitoring() {
  const { equipment } = useEquipment()
  const { user } = useAuth()
  const { toast } = useToast()
  const normalizeStation = (value: string) => value.trim().toLowerCase()
  const isAdminUser = user?.station === "All Stations"

  const [serviceEntries, setServiceEntries] = useState<ServiceEntry[]>([
    {
      id: "1",
      gseNumber: "GFHS/VTZ/GPU/01",
      station: "VTZ",
      serviceDone: "50",
      serviceDue: "50 HRS",
      dateDone: "10-Dec-22",
      dateDue: "09-Jun-23",
      dateCurrent: "14-Oct-25",
      datePending: -858,
      hrsDone: 453,
      hrsDue: 953,
      hrsCurrent: 453,
      hrsPending: 953,
      kmsDone: 0,
      kmsDue: 0,
      kmsCurrent: 0,
      kmsPending: 0,
      remarks: "",
    },
    {
      id: "2",
      gseNumber: "GFHS/VTZ/ACU/01",
      station: "VTZ",
      serviceDone: "28.3",
      serviceDue: "100 HRS",
      dateDone: "10-Dec-22",
      dateDue: "09-Jun-23",
      dateCurrent: "14-Oct-25",
      datePending: -858,
      hrsDone: 28.3,
      hrsDue: 328,
      hrsCurrent: 28.3,
      hrsPending: 328,
      kmsDone: 0,
      kmsDue: 0,
      kmsCurrent: 0,
      kmsPending: 0,
      remarks: "",
    },
    {
      id: "3",
      gseNumber: "GFHS/VTZ/ASU/01",
      station: "VTZ",
      serviceDone: "13.95",
      serviceDue: "100 HRS",
      dateDone: "10-Dec-22",
      dateDue: "09-Jun-23",
      dateCurrent: "14-Oct-25",
      datePending: -858,
      hrsDone: 13.95,
      hrsDue: 113,
      hrsCurrent: 13.95,
      hrsPending: 113,
      kmsDone: 0,
      kmsDue: 0,
      kmsCurrent: 0,
      kmsPending: 0,
      remarks: "",
    },
    {
      id: "4",
      gseNumber: "GFHS/PNQ/GPU/01",
      station: "Pune",
      serviceDone: "25",
      serviceDue: "100 HRS",
      dateDone: "2025-01-05",
      dateDue: "2025-04-05",
      dateCurrent: "2025-02-10",
      datePending: -54,
      hrsDone: 120,
      hrsDue: 220,
      hrsCurrent: 160,
      hrsPending: -60,
      kmsDone: 0,
      kmsDue: 0,
      kmsCurrent: 0,
      kmsPending: 0,
      remarks: "",
    },
    {
      id: "5",
      gseNumber: "GFHS/VTZ/ACU/01",
      station: "Visakhapatnam",
      serviceDone: "30",
      serviceDue: "100 HRS",
      dateDone: "2025-01-08",
      dateDue: "2025-04-08",
      dateCurrent: "2025-02-10",
      datePending: -57,
      hrsDone: 90,
      hrsDue: 190,
      hrsCurrent: 130,
      hrsPending: -60,
      kmsDone: 0,
      kmsDue: 0,
      kmsCurrent: 0,
      kmsPending: 0,
      remarks: "",
    },
  ])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const scopedServiceEntries =
    !user || isAdminUser
      ? serviceEntries
      : serviceEntries.filter((entry) => normalizeStation(entry.station) === normalizeStation(user.station))
  const [newEntry, setNewEntry] = useState({
    gseNumber: "",
    serviceDone: "",
    serviceDue: "",
    dateDone: "",
    dateDue: "",
    dateCurrent: new Date().toISOString().slice(0, 10),
    hrsDone: "",
    hrsDue: "",
    hrsCurrent: "",
    kmsDone: "",
    kmsDue: "",
    kmsCurrent: "",
    remarks: "",
  })

  const calculatePendingValues = () => {
    const datePending = calculateDaysDifference(newEntry.dateCurrent, newEntry.dateDue)
    const hrsPending = (Number(newEntry.hrsCurrent) || 0) - (Number(newEntry.hrsDue) || 0)
    const kmsPending = (Number(newEntry.kmsCurrent) || 0) - (Number(newEntry.kmsDue) || 0)

    return { datePending, hrsPending, kmsPending }
  }

  const handleAddService = () => {
    if (!newEntry.gseNumber) {
      toast({ title: "Error", description: "Please select an equipment", variant: "destructive" })
      return
    }

    const selectedEquipment = equipment.find((eq) => eq.gseNumber === newEntry.gseNumber)
    if (!selectedEquipment) return

    const { datePending, hrsPending, kmsPending } = calculatePendingValues()

    const entry: ServiceEntry = {
      id: Date.now().toString(),
      gseNumber: newEntry.gseNumber,
      station: selectedEquipment.station,
      serviceDone: newEntry.serviceDone,
      serviceDue: newEntry.serviceDue,
      dateDone: newEntry.dateDone,
      dateDue: newEntry.dateDue,
      dateCurrent: newEntry.dateCurrent,
      datePending,
      hrsDone: Number(newEntry.hrsDone) || 0,
      hrsDue: Number(newEntry.hrsDue) || 0,
      hrsCurrent: Number(newEntry.hrsCurrent) || 0,
      hrsPending,
      kmsDone: Number(newEntry.kmsDone) || 0,
      kmsDue: Number(newEntry.kmsDue) || 0,
      kmsCurrent: Number(newEntry.kmsCurrent) || 0,
      kmsPending,
      remarks: newEntry.remarks,
    }

    setServiceEntries([...serviceEntries, entry])
    setIsAddDialogOpen(false)

    // Reset form
    setNewEntry({
      gseNumber: "",
      serviceDone: "",
      serviceDue: "",
      dateDone: "",
      dateDue: "",
      dateCurrent: new Date().toISOString().slice(0, 10),
      hrsDone: "",
      hrsDue: "",
      hrsCurrent: "",
      kmsDone: "",
      kmsDue: "",
      kmsCurrent: "",
      remarks: "",
    })

    toast({ title: "Success", description: "Service entry added successfully" })
  }

  const exportToCSV = () => {
    const headers = [
      "Station",
      "Equipment ID",
      "Service Done",
      "Service Due",
      "Date Done",
      "Date Due",
      "Date Current",
      "Date Pending (Days)",
      "Hrs Done",
      "Hrs Due",
      "Hrs Current",
      "Hrs Pending",
      "KMS Done",
      "KMS Due",
      "KMS Current",
      "KMS Pending",
      "Remarks",
    ]
    const rows = serviceEntries.map((entry) => [
      entry.station,
      entry.gseNumber,
      entry.serviceDone,
      entry.serviceDue,
      entry.dateDone,
      entry.dateDue,
      entry.dateCurrent,
      entry.datePending,
      entry.hrsDone,
      entry.hrsDue,
      entry.hrsCurrent,
      entry.hrsPending,
      entry.kmsDone,
      entry.kmsDue,
      entry.kmsCurrent,
      entry.kmsPending,
      entry.remarks,
    ])
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `service-monitoring-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    toast({ title: "Exported", description: "Service monitoring data exported to CSV" })
  }

  const exportToPDF = () => {
    if (scopedServiceEntries.length === 0) {
      toast({ title: "No data", description: "Add service entries before exporting PDF.", variant: "destructive" })
      return
    }
    exportRowsToPDF(`service-monitoring-${new Date().toISOString().slice(0, 10)}`, scopedServiceEntries)
    toast({ title: "Exported", description: "Service monitoring data exported to PDF" })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white rounded-lg px-4 py-3 shadow-sm border border-border">
        <div className="flex items-center gap-3">
          <Input placeholder="Search equipment..." className="w-full md:w-64" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Service Entry</DialogTitle>
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
                          {eq.station} - {eq.gseNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Service Done</Label>
                    <Input
                      value={newEntry.serviceDone}
                      onChange={(e) => setNewEntry({ ...newEntry, serviceDone: e.target.value })}
                      placeholder="e.g., 50"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Service Due</Label>
                    <Input
                      value={newEntry.serviceDue}
                      onChange={(e) => setNewEntry({ ...newEntry, serviceDue: e.target.value })}
                      placeholder="e.g., 100 HRS"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Date Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label>Date Done</Label>
                      <Input
                        type="date"
                        value={newEntry.dateDone}
                        onChange={(e) => setNewEntry({ ...newEntry, dateDone: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Date Due</Label>
                      <Input
                        type="date"
                        value={newEntry.dateDue}
                        onChange={(e) => setNewEntry({ ...newEntry, dateDue: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Current Date</Label>
                      <Input
                        type="date"
                        value={newEntry.dateCurrent}
                        onChange={(e) => setNewEntry({ ...newEntry, dateCurrent: e.target.value })}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Pending Days: {calculateDaysDifference(newEntry.dateCurrent, newEntry.dateDue)} days
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Hours Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label>Hours Done</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="0"
                        value={newEntry.hrsDone}
                        onChange={(e) => setNewEntry({ ...newEntry, hrsDone: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Hours Due</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="0"
                        value={newEntry.hrsDue}
                        onChange={(e) => setNewEntry({ ...newEntry, hrsDue: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Current Hours</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="0"
                        value={newEntry.hrsCurrent}
                        onChange={(e) => setNewEntry({ ...newEntry, hrsCurrent: e.target.value })}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Pending Hours: {((Number(newEntry.hrsCurrent) || 0) - (Number(newEntry.hrsDue) || 0)).toFixed(1)}{" "}
                    hrs
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Kilometers Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label>KMS Done</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="0"
                        value={newEntry.kmsDone}
                        onChange={(e) => setNewEntry({ ...newEntry, kmsDone: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>KMS Due</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="0"
                        value={newEntry.kmsDue}
                        onChange={(e) => setNewEntry({ ...newEntry, kmsDue: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Current KMS</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="0"
                        value={newEntry.kmsCurrent}
                        onChange={(e) => setNewEntry({ ...newEntry, kmsCurrent: e.target.value })}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Pending KMS: {((Number(newEntry.kmsCurrent) || 0) - (Number(newEntry.kmsDue) || 0)).toFixed(1)} km
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label>Remarks</Label>
                  <Input
                    value={newEntry.remarks}
                    onChange={(e) => setNewEntry({ ...newEntry, remarks: e.target.value })}
                    placeholder="Additional notes"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddService}>Add Service Entry</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={exportToPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 border-b-2 border-border">
                <TableHead rowSpan={2} className="font-bold text-center border-r border-border align-middle">
                  STATION
                </TableHead>
                <TableHead rowSpan={2} className="font-bold text-center border-r border-border align-middle">
                  EQUIPMENT ID
                </TableHead>
                <TableHead colSpan={2} className="font-bold text-center border-r border-border">
                  TYPE OF SERVICE
                </TableHead>
                <TableHead colSpan={4} className="font-bold text-center border-r border-border">
                  DATE
                </TableHead>
                <TableHead colSpan={4} className="font-bold text-center border-r border-border">
                  HRS
                </TableHead>
                <TableHead colSpan={4} className="font-bold text-center border-r border-border">
                  KMS
                </TableHead>
                <TableHead rowSpan={2} className="font-bold text-center align-middle">
                  REMARKS
                </TableHead>
              </TableRow>
              <TableRow className="bg-muted/30 border-b-2 border-border">
                <TableHead className="font-semibold text-center border-r border-border">DONE</TableHead>
                <TableHead className="font-semibold text-center border-r border-border">DUE</TableHead>
                <TableHead className="font-semibold text-center border-r border-border">DONE</TableHead>
                <TableHead className="font-semibold text-center border-r border-border">DUE</TableHead>
                <TableHead className="font-semibold text-center border-r border-border">CURRENT</TableHead>
                <TableHead className="font-semibold text-center border-r border-border">PENDING</TableHead>
                <TableHead className="font-semibold text-center border-r border-border">DONE</TableHead>
                <TableHead className="font-semibold text-center border-r border-border">DUE</TableHead>
                <TableHead className="font-semibold text-center border-r border-border">CURRENT</TableHead>
                <TableHead className="font-semibold text-center border-r border-border">PENDING</TableHead>
                <TableHead className="font-semibold text-center border-r border-border">DONE</TableHead>
                <TableHead className="font-semibold text-center border-r border-border">DUE</TableHead>
                <TableHead className="font-semibold text-center border-r border-border">CURRENT</TableHead>
                <TableHead className="font-semibold text-center border-r border-border">PENDING</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scopedServiceEntries.map((entry) => (
                <TableRow
                  key={entry.id}
                  className={`${getRowColor(entry.gseNumber)} hover:opacity-80 border-b border-border`}
                >
                  <TableCell className="font-medium text-center border-r border-border">{entry.station}</TableCell>
                  <TableCell className="font-mono text-sm text-center border-r border-border">
                    {entry.gseNumber}
                  </TableCell>
                  <TableCell className="text-center border-r border-border">{entry.serviceDone}</TableCell>
                  <TableCell className="text-center border-r border-border">{entry.serviceDue}</TableCell>
                  <TableCell className="text-center border-r border-border">{entry.dateDone}</TableCell>
                  <TableCell className="text-center border-r border-border">{entry.dateDue}</TableCell>
                  <TableCell className="text-center border-r border-border">{entry.dateCurrent}</TableCell>
                  <TableCell
                    className={`text-center border-r border-border font-bold ${entry.datePending < 0 ? "text-red-600" : ""}`}
                  >
                    {entry.datePending}
                  </TableCell>
                  <TableCell className="text-center border-r border-border">{entry.hrsDone}</TableCell>
                  <TableCell className="text-center border-r border-border">{entry.hrsDue}</TableCell>
                  <TableCell className="text-center border-r border-border">{entry.hrsCurrent}</TableCell>
                  <TableCell
                    className={`text-center border-r border-border font-bold ${entry.hrsPending < 0 ? "text-red-600" : ""}`}
                  >
                    {entry.hrsPending}
                  </TableCell>
                  <TableCell className="text-center border-r border-border">{entry.kmsDone}</TableCell>
                  <TableCell className="text-center border-r border-border">{entry.kmsDue}</TableCell>
                  <TableCell className="text-center border-r border-border">{entry.kmsCurrent}</TableCell>
                  <TableCell
                    className={`text-center border-r border-border font-bold ${entry.kmsPending < 0 ? "text-red-600" : ""}`}
                  >
                    {entry.kmsPending}
                  </TableCell>
                  <TableCell className="text-center">{entry.remarks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
