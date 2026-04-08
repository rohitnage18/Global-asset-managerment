"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

type ServiceabilityEntry = {
  id: string
  date: string
  station: string
  equipmentId: string
  equipmentName: string
  status: string
  category: string
  groundingReason: string
  remarks: string
}

export function ServiceabilityReport() {
  const { equipment } = useEquipment()
  const { user } = useAuth()
  const { toast } = useToast()
  const normalizeStation = (value: string) => value.trim().toLowerCase()
  const isAdminUser = user?.station === "All Stations"
  const [entries, setEntries] = useState<ServiceabilityEntry[]>([
    {
      id: "1",
      date: "2022-06-30",
      station: "PATNA",
      equipmentId: "GFHS/PAT/GPU/01",
      equipmentName: "GROUND POWER UNIT GPU - AC/DC",
      status: "SERVICEBLE",
      category: "ASE",
      groundingReason: "",
      remarks: "",
    },
    {
      id: "2",
      date: "2022-06-30",
      station: "PATNA",
      equipmentId: "GFHS/PAT/ACU/01",
      equipmentName: "AIR CONDITIONING UNIT-ACU",
      status: "SERVICEBLE",
      category: "ASE",
      groundingReason: "",
      remarks: "",
    },
  ])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newEntry, setNewEntry] = useState({
    equipmentId: "",
    date: new Date().toISOString().split("T")[0],
    status: "",
    groundingReason: "",
    remarks: "",
  })

  const scopedEntries =
    !user || isAdminUser
      ? entries
      : entries.filter((entry) => normalizeStation(entry.station) === normalizeStation(user.station))

  const selectedEquipment = equipment.find((eq) => eq.gseNumber === newEntry.equipmentId)

  const handleAddEntry = () => {
    if (!newEntry.equipmentId || !newEntry.status) {
      toast({
        title: "Missing Information",
        description: "Please select equipment and status.",
        variant: "destructive",
      })
      return
    }

    const entry: ServiceabilityEntry = {
      id: Date.now().toString(),
      date: newEntry.date,
      station: selectedEquipment?.station || "",
      equipmentId: newEntry.equipmentId,
      equipmentName: selectedEquipment?.equipmentName || "",
      status: newEntry.status,
      category: selectedEquipment?.category || "",
      groundingReason: newEntry.groundingReason,
      remarks: newEntry.remarks,
    }

    setEntries((prev) => [...prev, entry])
    setIsAddDialogOpen(false)
    setNewEntry({
      equipmentId: "",
      date: new Date().toISOString().split("T")[0],
      status: "",
      groundingReason: "",
      remarks: "",
    })

    toast({
      title: "Service Entry Added",
      description: "The serviceability record has been added successfully.",
    })
  }

  const exportToCSV = () => {
    const headers = [
      "Sl/No",
      "Date",
      "Station",
      "Equipment ID",
      "Equipment Name",
      "Status",
      "Category (Type of Equipment)",
      "Grounding reason",
      "Remarks",
    ]
    const rows = scopedEntries.map((entry, index) => [
      index + 1,
      entry.date,
      entry.station,
      entry.equipmentId,
      entry.equipmentName,
      entry.status,
      entry.category,
      entry.groundingReason,
      entry.remarks,
    ])
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "serviceability-report.csv"
    a.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow-sm">
        <h3 className="text-base font-semibold">Equipment Serviceability Report</h3>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Service Entry</DialogTitle>
                <DialogDescription>Add a new serviceability record for equipment.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="equipment">Equipment *</Label>
                  <Select
                    value={newEntry.equipmentId}
                    onValueChange={(value) => setNewEntry({ ...newEntry, equipmentId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipment.map((eq) => (
                        <SelectItem key={eq.gseNumber} value={eq.gseNumber}>
                          {eq.gseNumber} - {eq.equipmentName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedEquipment && (
                  <>
                    <div className="grid gap-2">
                      <Label>Station</Label>
                      <Input value={selectedEquipment.station} disabled className="bg-muted" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Equipment Name</Label>
                      <Input value={selectedEquipment.equipmentName} disabled className="bg-muted" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Category</Label>
                      <Input value={selectedEquipment.category} disabled className="bg-muted" />
                    </div>
                  </>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={newEntry.status}
                    onValueChange={(value) => setNewEntry({ ...newEntry, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SERVICEBLE">SERVICEBLE</SelectItem>
                      <SelectItem value="UNSERVICEBLE">UNSERVICEBLE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="groundingReason">Grounding Reason</Label>
                  <Input
                    id="groundingReason"
                    value={newEntry.groundingReason}
                    onChange={(e) => setNewEntry({ ...newEntry, groundingReason: e.target.value })}
                    placeholder="Enter grounding reason if applicable"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Input
                    id="remarks"
                    value={newEntry.remarks}
                    onChange={(e) => setNewEntry({ ...newEntry, remarks: e.target.value })}
                    placeholder="Enter any remarks"
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
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <FileDown className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="text-center py-3 border-b-2 border-border font-semibold text-base">
          Equipment Serviceability Report
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 border-b-2 border-border">
                <TableHead className="font-semibold text-center border-r border-border">Sl/No</TableHead>
                <TableHead className="font-semibold text-center border-r border-border">Date</TableHead>
                <TableHead className="font-semibold text-center border-r border-border">Station</TableHead>
                <TableHead className="font-semibold text-center border-r border-border">Equipment ID</TableHead>
                <TableHead className="font-semibold text-center border-r border-border">Equipment Name</TableHead>
                <TableHead className="font-semibold text-center border-r border-border">Status</TableHead>
                <TableHead className="font-semibold text-center border-r border-border">
                  Category (Type of Equipment)
                </TableHead>
                <TableHead className="font-semibold text-center border-r border-border">Grounding reason</TableHead>
                <TableHead className="font-semibold text-center">Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scopedEntries.map((entry, index) => (
                <TableRow key={entry.id} className="hover:bg-muted/20">
                  <TableCell className="text-center border-r border-border">{index + 1}</TableCell>
                  <TableCell className="text-center border-r border-border">{entry.date}</TableCell>
                  <TableCell className="text-center border-r border-border">{entry.station}</TableCell>
                  <TableCell className="text-center border-r border-border font-mono text-sm">
                    {entry.equipmentId}
                  </TableCell>
                  <TableCell className="text-center border-r border-border">{entry.equipmentName}</TableCell>
                  <TableCell className="text-center border-r border-border">{entry.status}</TableCell>
                  <TableCell className="text-center border-r border-border">{entry.category}</TableCell>
                  <TableCell className="text-center border-r border-border">{entry.groundingReason}</TableCell>
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
