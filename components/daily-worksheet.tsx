"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { useEquipment } from "@/contexts/equipment-context"
import { Download, FileText, Plus } from "lucide-react"
import { exportPDF as exportRowsToPDF } from "@/components/shared/export-utils"

type WorkEntry = {
  id: string
  gseNumber: string
  station: string
  gseName: string
  date: string
  time: string
  hours: number | string
  kms: number | string
  sangDetails: string
  sangRectificationDetails: string
  sparesUsed: string
  quantity: number | string
  expSour: string
  perPieceCost: number | string
  totalCost: number
  jobDoneBy: string
  supBy: string
  remark: string
}

export function DailyWorksheet() {
  const { equipment } = useEquipment()
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { toast } = useToast()

  const [newEntry, setNewEntry] = useState({
    gseNumber: "",
    date: new Date().toISOString().split("T")[0],
    time: "",
    hours: "",
    kms: "",
    sangDetails: "",
    sangRectificationDetails: "",
    sparesUsed: "",
    quantity: "",
    expSour: "",
    perPieceCost: "",
    jobDoneBy: "",
    supBy: "",
    remark: "",
  })

  const calculatedTotalCost = useMemo(() => {
    const qty = Number(newEntry.quantity) || 0
    const perPiece = Number(newEntry.perPieceCost) || 0
    return qty * perPiece
  }, [newEntry.quantity, newEntry.perPieceCost])

  const handleEquipmentChange = (gseNumber: string) => {
    const selectedEquipment = equipment.find((eq) => eq.gseNumber === gseNumber)
    if (selectedEquipment) {
      setNewEntry((prev) => ({
        ...prev,
        gseNumber,
      }))
    }
  }

  const selectedEquipment = equipment.find((eq) => eq.gseNumber === newEntry.gseNumber)

  const handleAddWork = () => {
    if (!newEntry.gseNumber) {
      toast({
        title: "Error",
        description: "Please select an equipment",
        variant: "destructive",
      })
      return
    }

    const entry: WorkEntry = {
      id: Date.now().toString(),
      gseNumber: newEntry.gseNumber,
      station: selectedEquipment?.station || "",
      gseName: selectedEquipment?.gseName || "",
      date: newEntry.date,
      time: newEntry.time,
      hours: newEntry.hours,
      kms: newEntry.kms,
      sangDetails: newEntry.sangDetails,
      sangRectificationDetails: newEntry.sangRectificationDetails,
      sparesUsed: newEntry.sparesUsed,
      quantity: newEntry.quantity,
      expSour: newEntry.expSour,
      perPieceCost: newEntry.perPieceCost,
      totalCost: calculatedTotalCost,
      jobDoneBy: newEntry.jobDoneBy,
      supBy: newEntry.supBy,
      remark: newEntry.remark,
    }

    setWorkEntries((prev) => [...prev, entry])
    setIsAddDialogOpen(false)

    // Reset form
    setNewEntry({
      gseNumber: "",
      date: new Date().toISOString().split("T")[0],
      time: "",
      hours: "",
      kms: "",
      sangDetails: "",
      sangRectificationDetails: "",
      sparesUsed: "",
      quantity: "",
      expSour: "",
      perPieceCost: "",
      jobDoneBy: "",
      supBy: "",
      remark: "",
    })

    toast({
      title: "Success",
      description: "Daily work entry added successfully",
    })
  }

  const exportCSV = () => {
    const header =
      "Station,Date,Time,Equipment Name,Asset code,Hours,KMS,Sang details,Sang rectification details,spares used,Quantity,EXP.Sour,Per Piece Cost,Total Cost,Job done by,Sup by,Remark"
    const lines = workEntries
      .map((r) =>
        [
          r.station,
          r.date,
          r.time,
          `"${r.gseName}"`,
          r.gseNumber,
          r.hours,
          r.kms,
          `"${r.sangDetails}"`,
          `"${r.sangRectificationDetails}"`,
          `"${r.sparesUsed}"`,
          r.quantity,
          r.expSour,
          r.perPieceCost,
          r.totalCost,
          r.jobDoneBy,
          r.supBy,
          `"${r.remark}"`,
        ].join(","),
      )
      .join("\n")
    const blob = new Blob([header + "\n" + lines], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "daily-worksheet.csv"
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: "Exported CSV", description: `Exported ${workEntries.length} rows successfully` })
  }

  const handleExportPDF = () => {
    if (workEntries.length === 0) {
      toast({ title: "No data", description: "Add work entries before exporting PDF.", variant: "destructive" })
      return
    }
    exportRowsToPDF("daily-worksheet", workEntries)
    toast({ title: "Exported PDF", description: `Exported ${workEntries.length} rows successfully` })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white rounded-lg px-4 sm:px-6 py-4 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800">Daily Worksheet</h2>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Add Daily Work
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Daily Work Entry</DialogTitle>
                <DialogDescription>Fill in the details for the daily work entry</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="equipment">Equipment *</Label>
                  <Select value={newEntry.gseNumber} onValueChange={handleEquipmentChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipment.map((eq) => (
                        <SelectItem key={eq.gseNumber} value={eq.gseNumber}>
                          {eq.gseNumber} - {eq.gseName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedEquipment && (
                  <div className="grid gap-2">
                    <Label>Station</Label>
                    <Input value={selectedEquipment.station} disabled className="bg-gray-50" />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newEntry.time}
                      onChange={(e) => setNewEntry({ ...newEntry, time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="hours">Hours</Label>
                    <Input
                      id="hours"
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="Enter hours"
                      value={newEntry.hours}
                      onChange={(e) => setNewEntry({ ...newEntry, hours: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="kms">KMS</Label>
                    <Input
                      id="kms"
                      type="number"
                      min="0"
                      placeholder="Enter kilometers"
                      value={newEntry.kms}
                      onChange={(e) => setNewEntry({ ...newEntry, kms: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="sangDetails">Sang Details</Label>
                  <Input
                    id="sangDetails"
                    placeholder="Enter sang details"
                    value={newEntry.sangDetails}
                    onChange={(e) => setNewEntry({ ...newEntry, sangDetails: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="sangRectification">Sang Rectification Details</Label>
                  <Input
                    id="sangRectification"
                    placeholder="Enter rectification details"
                    value={newEntry.sangRectificationDetails}
                    onChange={(e) => setNewEntry({ ...newEntry, sangRectificationDetails: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="sparesUsed">Spares Used</Label>
                  <Input
                    id="sparesUsed"
                    placeholder="Enter spares used"
                    value={newEntry.sparesUsed}
                    onChange={(e) => setNewEntry({ ...newEntry, sparesUsed: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      placeholder="Enter quantity"
                      value={newEntry.quantity}
                      onChange={(e) => setNewEntry({ ...newEntry, quantity: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="expSour">EXP.Sour</Label>
                    <Input
                      id="expSour"
                      placeholder="Enter source"
                      value={newEntry.expSour}
                      onChange={(e) => setNewEntry({ ...newEntry, expSour: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="perPieceCost">Per Piece Cost (₹)</Label>
                    <Input
                      id="perPieceCost"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Enter per piece cost"
                      value={newEntry.perPieceCost}
                      onChange={(e) => setNewEntry({ ...newEntry, perPieceCost: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Total Cost (₹)</Label>
                    <Input value={calculatedTotalCost.toFixed(2)} disabled className="bg-gray-50 font-semibold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="jobDoneBy">Job Done By</Label>
                    <Input
                      id="jobDoneBy"
                      placeholder="Enter name"
                      value={newEntry.jobDoneBy}
                      onChange={(e) => setNewEntry({ ...newEntry, jobDoneBy: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="supBy">Supervised By</Label>
                    <Input
                      id="supBy"
                      placeholder="Enter name"
                      value={newEntry.supBy}
                      onChange={(e) => setNewEntry({ ...newEntry, supBy: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="remark">Remark</Label>
                  <Input
                    id="remark"
                    placeholder="Enter remark"
                    value={newEntry.remark}
                    onChange={(e) => setNewEntry({ ...newEntry, remark: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddWork}>Add Work Entry</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={exportCSV} variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={handleExportPDF} variant="outline" className="gap-2 bg-transparent">
            <FileText className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b-2">
                <TableHead className="font-semibold text-center border-r border-gray-300">Station</TableHead>
                <TableHead className="font-semibold text-center border-r border-gray-300">Date</TableHead>
                <TableHead className="font-semibold text-center border-r border-gray-300">Time</TableHead>
                <TableHead className="font-semibold text-center border-r border-gray-300">Equipment Name</TableHead>
                <TableHead className="font-semibold text-center border-r border-gray-300">Asset code</TableHead>
                <TableHead className="font-semibold text-center border-r border-gray-300">Hours</TableHead>
                <TableHead className="font-semibold text-center border-r border-gray-300">KMS</TableHead>
                <TableHead className="font-semibold text-center border-r border-gray-300">Sang details</TableHead>
                <TableHead className="font-semibold text-center border-r border-gray-300">
                  Sang rectification details
                </TableHead>
                <TableHead className="font-semibold text-center border-r border-gray-300">spares used</TableHead>
                <TableHead className="font-semibold text-center border-r border-gray-300">Quantity</TableHead>
                <TableHead className="font-semibold text-center border-r border-gray-300">EXP.Sour</TableHead>
                <TableHead className="font-semibold text-center border-r border-gray-300">Per Piece Cost</TableHead>
                <TableHead className="font-semibold text-center border-r border-gray-300">Total Cost</TableHead>
                <TableHead className="font-semibold text-center border-r border-gray-300">Job done by</TableHead>
                <TableHead className="font-semibold text-center border-r border-gray-300">Sup by</TableHead>
                <TableHead className="font-semibold text-center">Remark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={17} className="text-center py-8 text-gray-500">
                    No work entries yet. Click "Add Daily Work" to add an entry.
                  </TableCell>
                </TableRow>
              ) : (
                workEntries.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-gray-50">
                    <TableCell className="text-center border-r border-gray-200 font-medium">{entry.station}</TableCell>
                    <TableCell className="text-center border-r border-gray-200">{entry.date}</TableCell>
                    <TableCell className="text-center border-r border-gray-200">{entry.time}</TableCell>
                    <TableCell className="text-center border-r border-gray-200 font-medium">{entry.gseName}</TableCell>
                    <TableCell className="text-center border-r border-gray-200 font-mono text-sm">
                      {entry.gseNumber}
                    </TableCell>
                    <TableCell className="text-center border-r border-gray-200">{entry.hours}</TableCell>
                    <TableCell className="text-center border-r border-gray-200">{entry.kms}</TableCell>
                    <TableCell className="text-center border-r border-gray-200">{entry.sangDetails}</TableCell>
                    <TableCell className="text-center border-r border-gray-200">
                      {entry.sangRectificationDetails}
                    </TableCell>
                    <TableCell className="text-center border-r border-gray-200">{entry.sparesUsed}</TableCell>
                    <TableCell className="text-center border-r border-gray-200">{entry.quantity}</TableCell>
                    <TableCell className="text-center border-r border-gray-200">{entry.expSour}</TableCell>
                    <TableCell className="text-center border-r border-gray-200">₹{entry.perPieceCost}</TableCell>
                    <TableCell className="text-center border-r border-gray-200 font-semibold">
                      ₹{entry.totalCost.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center border-r border-gray-200">{entry.jobDoneBy}</TableCell>
                    <TableCell className="text-center border-r border-gray-200">{entry.supBy}</TableCell>
                    <TableCell className="text-center">{entry.remark}</TableCell>
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
