"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Download, Plus, Search } from "lucide-react"
import { useFuel } from "@/contexts/fuel-context"
import { useEquipment } from "@/contexts/equipment-context"
import { useToast } from "@/hooks/use-toast"

export function FuelReceived() {
  const { receivedEntries, addReceivedEntry } = useFuel()
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
    station: "",
    dateOfPurchase: "",
    invoiceNo: "",
    receivedPetrol: 0,
    receivedDiesel: 0,
    perLitrePetrolCost: 0,
    perLitreDieselCost: 0,
    totalCost: 0,
  })

  const stations = useMemo(() => {
    const uniqueStations = new Set(equipment.map((eq) => eq.station))
    return Array.from(uniqueStations).sort()
  }, [equipment])

  const categories = useMemo(() => {
    const uniqueCategories = new Set(equipment.map((eq) => eq.gseCategory).filter(Boolean))
    return Array.from(uniqueCategories).sort()
  }, [equipment])

  const filteredEntries = useMemo(() => {
    return receivedEntries.filter((entry) => {
      const matchesStation = stationFilter === "all" || entry.station === stationFilter
      const matchesSearch =
        searchTerm === "" ||
        Object.values(entry).some((val) => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesDateFrom = !dateFrom || entry.date >= dateFrom
      const matchesDateTo = !dateTo || entry.date <= dateTo

      return matchesStation && matchesSearch && matchesDateFrom && matchesDateTo
    })
  }, [receivedEntries, stationFilter, searchTerm, dateFrom, dateTo])

  const handleAddEntry = () => {
    if (!newEntry.station || !newEntry.invoiceNo) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const calculatedTotalCost =
      newEntry.receivedPetrol * newEntry.perLitrePetrolCost + newEntry.receivedDiesel * newEntry.perLitreDieselCost

    addReceivedEntry({
      ...newEntry,
      totalCost: calculatedTotalCost,
    })

    toast({
      title: "✅ Entry Added Successfully",
      description: `Fuel received data for ${newEntry.station} has been added.`,
      className: "bg-green-50 border-green-200",
    })

    setNewEntry({
      date: new Date().toISOString().split("T")[0],
      station: "",
      dateOfPurchase: "",
      invoiceNo: "",
      receivedPetrol: 0,
      receivedDiesel: 0,
      perLitrePetrolCost: 0,
      perLitreDieselCost: 0,
      totalCost: 0,
    })
    setIsAddDialogOpen(false)
  }

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Station",
      "Date of Purchase",
      "Invoice No",
      "Received Petrol",
      "Received Diesel",
      "Per Litre Petrol Cost",
      "Per Litre Diesel Cost",
      "Total Cost",
    ]
    const csvData = filteredEntries.map((entry) => [
      entry.date,
      entry.station,
      entry.dateOfPurchase,
      entry.invoiceNo,
      entry.receivedPetrol,
      entry.receivedDiesel,
      entry.perLitrePetrolCost,
      entry.perLitreDieselCost,
      entry.totalCost,
    ])

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `fuel-received-${new Date().toISOString().split("T")[0]}.csv`
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

          <div className="flex gap-2">
            <div className="relative w-[150px]">
              {!dateFrom && (
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  Date from
                </span>
              )}
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full"
                aria-label="Date from"
              />
            </div>
            <div className="relative w-[150px]">
              {!dateTo && (
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  Date to
                </span>
              )}
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
                Add Received Data
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Fuel Received Data</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date*</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEntry.date}
                      onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="station">Station*</Label>
                    <Select
                      value={newEntry.station}
                      onValueChange={(value) => setNewEntry({ ...newEntry, station: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select station" />
                      </SelectTrigger>
                      <SelectContent>
                        {stations.map((station) => (
                          <SelectItem key={station} value={station}>
                            {station}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfPurchase">Date of Purchase</Label>
                    <Input
                      id="dateOfPurchase"
                      type="date"
                      value={newEntry.dateOfPurchase}
                      onChange={(e) => setNewEntry({ ...newEntry, dateOfPurchase: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNo">Invoice No*</Label>
                    <Input
                      id="invoiceNo"
                      value={newEntry.invoiceNo}
                      onChange={(e) => setNewEntry({ ...newEntry, invoiceNo: e.target.value })}
                      placeholder="Enter invoice number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="receivedPetrol">Received Petrol (Litres)</Label>
                    <Input
                      id="receivedPetrol"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newEntry.receivedPetrol || ""}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, receivedPetrol: Number.parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receivedDiesel">Received Diesel (Litres)</Label>
                    <Input
                      id="receivedDiesel"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newEntry.receivedDiesel || ""}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, receivedDiesel: Number.parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Cost (₹)</Label>
                    <Input
                      value={(
                        newEntry.receivedPetrol * newEntry.perLitrePetrolCost +
                        newEntry.receivedDiesel * newEntry.perLitreDieselCost
                      ).toFixed(2)}
                      disabled
                      className="bg-muted"
                    />
                  </div>
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

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="border p-3 text-center font-semibold">Date</th>
                <th className="border p-3 text-center font-semibold">Station</th>
                <th className="border p-3 text-center font-semibold">Date of Purchase</th>
                <th className="border p-3 text-center font-semibold">Invoice No</th>
                <th className="border p-3 text-center font-semibold">Received Petrol</th>
                <th className="border p-3 text-center font-semibold">Received Diesel</th>
                <th className="border p-3 text-center font-semibold">Per Litre Petrol Cost</th>
                <th className="border p-3 text-center font-semibold">Per Litre Diesel Cost</th>
                <th className="border p-3 text-center font-semibold">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-muted/30">
                  <td className="border p-2 text-center">{entry.date}</td>
                  <td className="border p-2 text-center">{entry.station}</td>
                  <td className="border p-2 text-center">{entry.dateOfPurchase}</td>
                  <td className="border p-2 text-center">{entry.invoiceNo}</td>
                  <td className="border p-2 text-center">{entry.receivedPetrol}</td>
                  <td className="border p-2 text-center">{entry.receivedDiesel}</td>
                  <td className="border p-2 text-center">₹{entry.perLitrePetrolCost}</td>
                  <td className="border p-2 text-center">₹{entry.perLitreDieselCost}</td>
                  <td className="border p-2 text-center">₹{entry.totalCost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
