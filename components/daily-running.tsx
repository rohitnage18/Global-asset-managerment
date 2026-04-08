"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { useEquipment } from "@/contexts/equipment-context" // Fixed import path
import { useAuth } from "@/contexts/auth-context"

type DailyRunEntry = {
  id: string
  gseNumber: string
  station: string
  date: string
  openingHours: number
  closingHours: number
  usedHours: number
}

export function DailyRunning() {
  const { equipment } = useEquipment() // Declare the useEquipment hook
  const { user } = useAuth()
  const normalizeStation = (value: string) => value.trim().toLowerCase()
  const isAdminUser = user?.station === "All Stations"
  const [dailyRuns, setDailyRuns] = useState<DailyRunEntry[]>([
    {
      id: "1",
      gseNumber: "GFHS/PAT/GPU/01",
      station: "PATNA",
      date: "2025-01-14",
      openingHours: 18.6,
      closingHours: 19.8,
      usedHours: 1.2,
    },
    {
      id: "2",
      gseNumber: "GFHS/PAT/ACU/01",
      station: "PATNA",
      date: "2025-01-14",
      openingHours: 28.3,
      closingHours: 30.5,
      usedHours: 2.2,
    },
    {
      id: "3",
      gseNumber: "GFHS/PAT/PCB/01",
      station: "PATNA",
      date: "2025-01-14",
      openingHours: 480,
      closingHours: 485,
      usedHours: 5,
    },
    {
      id: "4",
      gseNumber: "GFHS/PNQ/GPU/01",
      station: "Pune",
      date: "2025-01-14",
      openingHours: 12.2,
      closingHours: 13.6,
      usedHours: 1.4,
    },
    {
      id: "5",
      gseNumber: "GFHS/VTZ/ACU/01",
      station: "Visakhapatnam",
      date: "2025-01-14",
      openingHours: 22.1,
      closingHours: 23.4,
      usedHours: 1.3,
    },
  ])
  const [stationFilter, setStationFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const { toast } = useToast()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newRun, setNewRun] = useState({
    gseNumber: "",
    date: new Date().toISOString().split("T")[0],
    openingHours: 0,
    closingHours: "",
  })

  const scopedDailyRuns =
    !user || isAdminUser
      ? dailyRuns
      : dailyRuns.filter((entry) => normalizeStation(entry.station) === normalizeStation(user.station))

  const uniqueStations = Array.from(new Set(equipment.map((e) => e.station)))
  const uniqueCategories = Array.from(new Set(equipment.map((e) => e.gseCategory).filter(Boolean)))

  const filteredRows = useMemo(() => {
    let filtered = scopedDailyRuns

    if (stationFilter !== "all") {
      filtered = filtered.filter((r) => r.station === stationFilter)
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((r) => {
        const eq = equipment.find((e) => e.gseNumber === r.gseNumber)
        return eq?.gseCategory === categoryFilter
      })
    }

    if (dateFrom) {
      filtered = filtered.filter((r) => r.date >= dateFrom)
    }

    if (dateTo) {
      filtered = filtered.filter((r) => r.date <= dateTo)
    }

    if (searchTerm) {
      filtered = filtered.filter((r) =>
        Object.values(r).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    return filtered
  }, [scopedDailyRuns, stationFilter, categoryFilter, dateFrom, dateTo, searchTerm, equipment])

  const getLastClosingHours = (gseNumber: string): number => {
    console.log("[v0] Getting last closing hours for:", gseNumber)
    console.log("[v0] All daily runs:", dailyRuns)

    const equipmentRuns = dailyRuns
      .filter((run) => run.gseNumber === gseNumber)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    console.log("[v0] Filtered equipment runs:", equipmentRuns)
    console.log("[v0] Last closing hours:", equipmentRuns.length > 0 ? equipmentRuns[0].closingHours : 0)

    return equipmentRuns.length > 0 ? equipmentRuns[0].closingHours : 0
  }

  const handleEquipmentSelect = (gseNumber: string) => {
    console.log("[v0] Equipment selected:", gseNumber)
    const lastClosingHours = getLastClosingHours(gseNumber)
    console.log("[v0] Setting opening hours to:", lastClosingHours)

    setNewRun({
      ...newRun,
      gseNumber,
      openingHours: lastClosingHours,
    })
  }

  const handleAddDailyRun = () => {
    if (!newRun.gseNumber || !newRun.date || newRun.closingHours === "") {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const selectedEquipment = equipment.find((eq) => eq.gseNumber === newRun.gseNumber)
    if (!selectedEquipment) return

    const openingHours = newRun.openingHours
    const closingHours = Number(newRun.closingHours)
    const usedHours = closingHours - openingHours

    const newEntry: DailyRunEntry = {
      id: Date.now().toString(),
      gseNumber: newRun.gseNumber,
      station: selectedEquipment.station,
      date: newRun.date,
      openingHours,
      closingHours,
      usedHours,
    }

    setDailyRuns([...dailyRuns, newEntry])
    setIsAddDialogOpen(false)
    setNewRun({
      gseNumber: "",
      date: new Date().toISOString().split("T")[0],
      openingHours: 0,
      closingHours: "",
    })
    toast({
      title: "✅ Daily Run Added Successfully",
      description: `Entry for ${newRun.gseNumber} has been added to the system.`,
      variant: "success",
      duration: 5000,
    })
  }

  const exportCSV = () => {
    const header = ["Date", "Station", "Equipment ID", "Opening hours", "closing hours", "Uses hours"].join(",")
    const lines = filteredRows
      .map((r) => [r.date, r.station, r.gseNumber, r.openingHours, r.closingHours, r.usedHours.toFixed(1)].join(","))
      .join("\n")
    const blob = new Blob([header + "\n" + lines], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "daily-running.csv"
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: "Exported CSV", description: `Rows: ${filteredRows.length}` })
  }

  const exportPDF = () => {
    const w = window.open("", "_blank")
    if (!w) return
    w.document.write(`
      <html><head><title>Daily Running hours & KMS</title>
      <style>
        body{font-family:Arial, sans-serif;margin:20px}
        h2{text-align:center;margin-bottom:20px}
        table{width:100%;border-collapse:collapse;font-size:14px}
        th,td{border:1px solid #000;padding:8px;text-align:center}
        th{background:#f0f0f0;font-weight:bold}
      </style>
      </head><body>
      <h2>Daily Running hours & KMS</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th><th>Station</th><th>Equipment ID</th>
            <th>Opening hours</th><th>closing hours</th><th>Uses hours</th>
          </tr>
        </thead>
        <tbody>
          ${filteredRows
            .map(
              (r) => `<tr>
                <td>${r.date}</td><td>${r.station}</td><td>${r.gseNumber}</td>
                <td>${r.openingHours}</td><td>${r.closingHours}</td><td>${r.usedHours.toFixed(1)}</td>
              </tr>`,
            )
            .join("")}
        </tbody>
      </table>
      </body></html>
    `)
    w.document.close()
    w.print()
    w.close()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between bg-white px-4 py-3 rounded-lg shadow-sm">
        <div className="flex flex-wrap gap-2">
          <Select value={stationFilter} onValueChange={setStationFilter}>
            <SelectTrigger className="w-full sm:w-40 h-9 text-sm border-border/50">
              <SelectValue placeholder="All Stations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stations</SelectItem>
              {uniqueStations.map((station) => (
                <SelectItem key={station} value={station}>
                  {station}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-40 h-9 text-sm border-border/50">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="w-full sm:w-40">
            <p className="text-xs text-muted-foreground mb-1">Date from</p>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full h-9 text-sm border-border/50"
              aria-label="Date from"
            />
          </div>

          <div className="w-full sm:w-40">
            <p className="text-xs text-muted-foreground mb-1">Date to</p>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full h-9 text-sm border-border/50"
              aria-label="Date to"
            />
          </div>

          <Input
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 h-9 text-sm border-border/50"
          />
        </div>

        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-sm shadow-sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Daily Run
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Daily Run</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="equipment">Equipment ID *</Label>
                  <Select value={newRun.gseNumber} onValueChange={handleEquipmentSelect}>
                    <SelectTrigger id="equipment">
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipment.map((eq) => (
                        <SelectItem key={eq.gseNumber} value={eq.gseNumber}>
                          {eq.gseNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {newRun.gseNumber && (
                  <>
                    <div className="space-y-2">
                      <Label>Station</Label>
                      <Input
                        value={equipment.find((eq) => eq.gseNumber === newRun.gseNumber)?.station || ""}
                        disabled
                        className="bg-muted"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newRun.date}
                        onChange={(e) => setNewRun({ ...newRun, date: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="openingHours">Opening Hours (Auto-populated)</Label>
                      <Input
                        id="openingHours"
                        type="number"
                        value={newRun.openingHours}
                        disabled
                        className="bg-muted font-semibold"
                      />
                      <p className="text-xs text-muted-foreground">
                        {newRun.openingHours === 0
                          ? "No previous entry found. Starting from 0."
                          : `Taken from last closing hours: ${newRun.openingHours}`}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="closingHours">Closing Hours *</Label>
                      <Input
                        id="closingHours"
                        type="number"
                        step="0.1"
                        placeholder="Enter closing hours"
                        value={newRun.closingHours}
                        onChange={(e) => setNewRun({ ...newRun, closingHours: e.target.value })}
                      />
                    </div>

                    {newRun.closingHours && (
                      <div className="space-y-2">
                        <Label>Used Hours (Auto-calculated)</Label>
                        <Input
                          value={(Number(newRun.closingHours) - newRun.openingHours).toFixed(1)}
                          disabled
                          className="bg-muted font-semibold"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddDailyRun}>Add Daily Run</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-sm shadow-sm"
            onClick={exportCSV}
          >
            Export CSV
          </Button>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-sm shadow-sm"
            onClick={exportPDF}
          >
            Export PDF
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-border">
        <div className="bg-muted/50 px-4 py-3 border-b-2 border-border">
          <h2 className="text-center text-lg font-semibold">Daily Running hours & KMS</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 border-b-2 border-border">
                <TableHead className="font-bold text-center border-r border-border">Date</TableHead>
                <TableHead className="font-bold text-center border-r border-border">Station</TableHead>
                <TableHead className="font-bold text-center border-r border-border">Equipment ID</TableHead>
                <TableHead className="font-bold text-center border-r border-border">Opening hours</TableHead>
                <TableHead className="font-bold text-center border-r border-border">closing hours</TableHead>
                <TableHead className="font-bold text-center">Uses hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((r) => (
                <TableRow key={r.id} className="border-b border-border">
                  <TableCell className="text-center border-r border-border">{r.date}</TableCell>
                  <TableCell className="text-center font-medium border-r border-border">{r.station}</TableCell>
                  <TableCell className="text-center font-mono text-sm border-r border-border">{r.gseNumber}</TableCell>
                  <TableCell className="text-center border-r border-border">{r.openingHours}</TableCell>
                  <TableCell className="text-center border-r border-border">{r.closingHours}</TableCell>
                  <TableCell
                    className={`text-center font-semibold bg-muted/20 ${r.usedHours < 0 ? "text-red-600" : ""}`}
                  >
                    {r.usedHours.toFixed(1)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
