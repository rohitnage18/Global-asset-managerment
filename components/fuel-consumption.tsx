"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Download, Plus, Search, Fuel } from "lucide-react"
import { useFuel } from "@/contexts/fuel-context"
import { useEquipment } from "@/contexts/equipment-context"
import { useToast } from "@/hooks/use-toast"

export function FuelConsumption() {
  const { consumptionEntries, addConsumptionEntry, getInstockPetrol, getInstockDiesel } = useFuel()
  const { equipment } = useEquipment()
  const { toast } = useToast()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [stationFilter, setStationFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split("T")[0],
    gseNumber: "",
    station: "",
    gseName: "",
    gseCategory: "",
    openingHours: 0,
    closingHours: 0,
    usedHours: 0,
    fuelConsumptionAverage: 0,
    topUpDiesel: 0,
    topUpPetrol: 0,
    perLitrePetrolCost: 0,
    perLitreDieselCost: 0,
    totalCost: 0,
    workDoneBy: "",
    supervisedBy: "",
    remark: "",
    balanceFuel: 0,
  })

  const instockPetrol = getInstockPetrol()
  const instockDiesel = getInstockDiesel()

  const stations = useMemo(() => {
    const uniqueStations = new Set(equipment.map((eq) => eq.station))
    return Array.from(uniqueStations).sort()
  }, [equipment])

  const categories = useMemo(() => {
    const uniqueCategories = new Set(equipment.map((eq) => eq.gseCategory).filter(Boolean))
    return Array.from(uniqueCategories).sort()
  }, [equipment])

  const filteredEntries = useMemo(() => {
    return consumptionEntries.filter((entry) => {
      const matchesStation = stationFilter === "all" || entry.station === stationFilter
      const matchesCategory = categoryFilter === "all" || entry.gseCategory === categoryFilter
      const matchesSearch =
        searchTerm === "" ||
        Object.values(entry).some((val) => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesDateFrom = !dateFrom || entry.date >= dateFrom
      const matchesDateTo = !dateTo || entry.date <= dateTo

      return matchesStation && matchesCategory && matchesSearch && matchesDateFrom && matchesDateTo
    })
  }, [consumptionEntries, stationFilter, categoryFilter, searchTerm, dateFrom, dateTo])

  const getLastClosingHours = (gseNumber: string): number => {
    const equipmentRuns = consumptionEntries
      .filter((run) => run.gseNumber === gseNumber)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    if (equipmentRuns.length > 0) {
      return equipmentRuns[0].closingHours
    }
    return 1
  }

  useEffect(() => {
    if (newEntry.gseNumber) {
      const selectedEquipment = equipment.find((eq) => eq.gseNumber === newEntry.gseNumber)
      if (selectedEquipment) {
        const lastClosing = getLastClosingHours(newEntry.gseNumber)
        setNewEntry((prev) => ({
          ...prev,
          station: selectedEquipment.station,
          gseName: selectedEquipment.gseName,
          gseCategory: selectedEquipment.gseCategory,
          openingHours: lastClosing,
        }))
      }
    }
  }, [newEntry.gseNumber, equipment])

  useEffect(() => {
    const usedHours = newEntry.closingHours - newEntry.openingHours
    const fuelUsed = newEntry.topUpDiesel || newEntry.topUpPetrol
    const fuelConsumptionAvg = fuelUsed > 0 ? usedHours / fuelUsed : 0
    const totalCost =
      newEntry.topUpPetrol * newEntry.perLitrePetrolCost + newEntry.topUpDiesel * newEntry.perLitreDieselCost

    setNewEntry((prev) => ({
      ...prev,
      usedHours,
      fuelConsumptionAverage: fuelConsumptionAvg,
      totalCost,
    }))
  }, [
    newEntry.closingHours,
    newEntry.openingHours,
    newEntry.topUpDiesel,
    newEntry.topUpPetrol,
    newEntry.perLitrePetrolCost,
    newEntry.perLitreDieselCost,
  ])

  const handleAddEntry = () => {
    if (!newEntry.gseNumber) {
      toast({
        title: "Missing Information",
        description: "Please select an equipment.",
        variant: "destructive",
      })
      return
    }

    const fuelUsed = newEntry.topUpDiesel || newEntry.topUpPetrol
    const currentInstock = newEntry.topUpDiesel > 0 ? instockDiesel : instockPetrol
    const balanceFuel = currentInstock - fuelUsed

    addConsumptionEntry({
      ...newEntry,
      balanceFuel,
    })

    toast({
      title: "✅ Entry Added Successfully",
      description: `Fuel consumption data for ${newEntry.gseNumber} has been added.`,
      className: "bg-green-50 border-green-200",
    })

    setNewEntry({
      date: new Date().toISOString().split("T")[0],
      gseNumber: "",
      station: "",
      gseName: "",
      gseCategory: "",
      openingHours: 0,
      closingHours: 0,
      usedHours: 0,
      fuelConsumptionAverage: 0,
      topUpDiesel: 0,
      topUpPetrol: 0,
      perLitrePetrolCost: 0,
      perLitreDieselCost: 0,
      totalCost: 0,
      workDoneBy: "",
      supervisedBy: "",
      remark: "",
      balanceFuel: 0,
    })
    setIsAddDialogOpen(false)
  }

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Station",
      "Equipment ID",
      "Category",
      "Opening Hours",
      "Closing Hours",
      "Used Hours",
      "Fuel Consumption Avg",
      "Top Up Diesel",
      "Top Up Petrol",
      "Per Litre Petrol Cost",
      "Per Litre Diesel Cost",
      "Total Cost",
      "Balance Fuel",
      "Work Done By",
      "Supervised By",
      "Remark",
    ]
    const csvData = filteredEntries.map((entry) => [
      entry.date,
      entry.station,
      entry.gseNumber,
      entry.gseCategory,
      entry.openingHours,
      entry.closingHours,
      entry.usedHours,
      entry.fuelConsumptionAverage.toFixed(2),
      entry.topUpDiesel,
      entry.topUpPetrol,
      entry.perLitrePetrolCost,
      entry.perLitreDieselCost,
      entry.totalCost.toFixed(2),
      entry.balanceFuel.toFixed(2),
      entry.workDoneBy,
      entry.supervisedBy,
      entry.remark,
    ])

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `fuel-consumption-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <Select value={stationFilter} onValueChange={setStationFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Stations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stations</SelectItem>
              {stations.map((station) => (
                <SelectItem key={station} value={station}>
                  {station}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <div className="w-[150px]">
              <p className="text-xs text-muted-foreground mb-1">Date from</p>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full"
                aria-label="Date from"
              />
            </div>
            <div className="w-[150px]">
              <p className="text-xs text-muted-foreground mb-1">Date to</p>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full"
                aria-label="Date to"
              />
            </div>
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Fuel Data
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Fuel Consumption Data</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="equipment">Equipment*</Label>
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
                            {eq.gseNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="station">Station</Label>
                    <Input id="station" value={newEntry.station} disabled className="bg-muted" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" value={newEntry.date} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="openingHours">Opening Hours</Label>
                    <Input
                      id="openingHours"
                      type="number"
                      value={newEntry.openingHours}
                      disabled
                      className="bg-muted text-center"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="closingHours">Closing Hours*</Label>
                    <Input
                      id="closingHours"
                      type="number"
                      step="0.1"
                      value={newEntry.closingHours || ""}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, closingHours: Number.parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0"
                      className="text-center"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Used Hours</Label>
                    <Input value={newEntry.usedHours.toFixed(1)} disabled className="bg-muted text-center" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topUpDiesel">Top Up Diesel (L)</Label>
                    <Input
                      id="topUpDiesel"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newEntry.topUpDiesel || ""}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, topUpDiesel: Number.parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0"
                      className="text-center"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topUpPetrol">Top Up Petrol (L)</Label>
                    <Input
                      id="topUpPetrol"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newEntry.topUpPetrol || ""}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, topUpPetrol: Number.parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0"
                      className="text-center"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Fuel Consumption Avg</Label>
                    <Input
                      value={newEntry.fuelConsumptionAverage.toFixed(2)}
                      disabled
                      className="bg-muted text-center"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="perLitrePetrolCost">Per Litre Petrol Cost (₹)</Label>
                    <Input
                      id="perLitrePetrolCost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newEntry.perLitrePetrolCost || ""}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, perLitrePetrolCost: Number.parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0"
                      className="text-center"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="perLitreDieselCost">Per Litre Diesel Cost (₹)</Label>
                    <Input
                      id="perLitreDieselCost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newEntry.perLitreDieselCost || ""}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, perLitreDieselCost: Number.parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0"
                      className="text-center"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Total Cost (₹)</Label>
                    <Input value={newEntry.totalCost.toFixed(2)} disabled className="bg-muted text-center" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workDoneBy">Work Done By</Label>
                    <Input
                      id="workDoneBy"
                      value={newEntry.workDoneBy}
                      onChange={(e) => setNewEntry({ ...newEntry, workDoneBy: e.target.value })}
                      placeholder="Enter name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supervisedBy">Supervised By</Label>
                    <Input
                      id="supervisedBy"
                      value={newEntry.supervisedBy}
                      onChange={(e) => setNewEntry({ ...newEntry, supervisedBy: e.target.value })}
                      placeholder="Enter name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remark">Remark</Label>
                  <Input
                    id="remark"
                    value={newEntry.remark}
                    onChange={(e) => setNewEntry({ ...newEntry, remark: e.target.value })}
                    placeholder="Enter remarks"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEntry}>Add Entry</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={exportToCSV} className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg shadow-sm">
          <Fuel className="h-6 w-6 text-blue-600" />
          <div>
            <p className="text-sm text-blue-600 font-medium">Instock: Petrol</p>
            <p className={`text-2xl font-bold ${instockPetrol < 0 ? "text-red-600" : "text-blue-700"}`}>
              {instockPetrol.toFixed(2)} L
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-200 rounded-lg shadow-sm">
          <Fuel className="h-6 w-6 text-amber-600" />
          <div>
            <p className="text-sm text-amber-600 font-medium">Instock: Diesel</p>
            <p className={`text-2xl font-bold ${instockDiesel < 0 ? "text-red-600" : "text-amber-700"}`}>
              {instockDiesel.toFixed(2)} L
            </p>
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="border p-3 text-center font-semibold text-sm">Date</th>
                <th className="border p-3 text-center font-semibold text-sm">Station</th>
                <th className="border p-3 text-center font-semibold text-sm">Equipment ID</th>
                <th className="border p-3 text-center font-semibold text-sm">Category</th>
                <th className="border p-3 text-center font-semibold text-sm">Opening Hours</th>
                <th className="border p-3 text-center font-semibold text-sm">Closing Hours</th>
                <th className="border p-3 text-center font-semibold text-sm">Used Hours</th>
                <th className="border p-3 text-center font-semibold text-sm">Fuel Consumption Avg</th>
                <th className="border p-3 text-center font-semibold text-sm">Top Up Diesel</th>
                <th className="border p-3 text-center font-semibold text-sm">Top Up Petrol</th>
                <th className="border p-3 text-center font-semibold text-sm">Per Litre Petrol Cost</th>
                <th className="border p-3 text-center font-semibold text-sm">Per Litre Diesel Cost</th>
                <th className="border p-3 text-center font-semibold text-sm">Total Cost</th>
                <th className="border p-3 text-center font-semibold text-sm">Balance Fuel</th>
                <th className="border p-3 text-center font-semibold text-sm">Work Done By</th>
                <th className="border p-3 text-center font-semibold text-sm">Supervised By</th>
                <th className="border p-3 text-center font-semibold text-sm">Remark</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-muted/30">
                  <td className="border p-2 text-center text-sm">{entry.date}</td>
                  <td className="border p-2 text-center text-sm">{entry.station}</td>
                  <td className="border p-2 text-center text-sm">{entry.gseNumber}</td>
                  <td className="border p-2 text-center text-sm">{entry.gseCategory}</td>
                  <td className="border p-2 text-center text-sm">{entry.openingHours}</td>
                  <td className="border p-2 text-center text-sm">{entry.closingHours}</td>
                  <td
                    className={`border p-2 text-center text-sm ${entry.usedHours < 0 ? "text-red-600 font-semibold" : ""}`}
                  >
                    {entry.usedHours.toFixed(1)}
                  </td>
                  <td className="border p-2 text-center text-sm">{entry.fuelConsumptionAverage.toFixed(2)}</td>
                  <td className="border p-2 text-center text-sm">{entry.topUpDiesel}</td>
                  <td className="border p-2 text-center text-sm">{entry.topUpPetrol}</td>
                  <td className="border p-2 text-center text-sm">₹{entry.perLitrePetrolCost}</td>
                  <td className="border p-2 text-center text-sm">₹{entry.perLitreDieselCost}</td>
                  <td className="border p-2 text-center text-sm">₹{entry.totalCost.toFixed(2)}</td>
                  <td
                    className={`border p-2 text-center text-sm font-semibold ${entry.balanceFuel < 0 ? "text-red-600" : "text-green-600"}`}
                  >
                    {entry.balanceFuel.toFixed(2)}
                  </td>
                  <td className="border p-2 text-center text-sm">{entry.workDoneBy}</td>
                  <td className="border p-2 text-center text-sm">{entry.supervisedBy}</td>
                  <td className="border p-2 text-center text-sm">{entry.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
