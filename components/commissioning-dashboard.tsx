"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { useEquipment } from "@/contexts/equipment-context"

// Inline SVG components
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const FilterIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    />
  </svg>
)

const FileDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
)

const FileTextIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
)

const ChevronLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

const PencilIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
  </svg>
)

interface Equipment {
  slNo: string
  date: string
  station: string
  gseName: string
  gseNumber: string
  gseCategory: string
  slNumber: string
  dateOfPurchase: string
  invoiceNo: string
  unitReceivedDateAtStation: string
  dateOfCommission: string
  dateOfOPS: string
  remarks: string
}

const sampleEquipment: Equipment[] = [
  {
    slNo: "1",
    date: "2023-07-07",
    station: "PAT",
    gseName: "GROUND POWER UNIT GPU - AC/DC",
    gseNumber: "GFHS/PAT/GPU/01",
    gseCategory: "GPU",
    slNumber: "T718811",
    dateOfPurchase: "2022-01-07",
    invoiceNo: "INV/2022/001",
    unitReceivedDateAtStation: "2022-02-18",
    dateOfCommission: "2022-03-01",
    dateOfOPS: "2022-03-15",
    remarks: "Operational and in good condition",
  },
  {
    slNo: "2",
    date: "2023-07-10",
    station: "PAT",
    gseName: "AIR CONDITIONING UNIT - ACU",
    gseNumber: "GFHS/PAT/ACU/01",
    gseCategory: "ACU",
    slNumber: "T726410",
    dateOfPurchase: "2022-04-01",
    invoiceNo: "INV/2022/045",
    unitReceivedDateAtStation: "2022-04-06",
    dateOfCommission: "2022-04-20",
    dateOfOPS: "2022-05-01",
    remarks: "Regular maintenance scheduled",
  },
  {
    slNo: "3",
    date: "2023-08-15",
    station: "Pune",
    gseName: "BAGGAGE TRACTOR",
    gseNumber: "GFHS/PNQ/BT/01",
    gseCategory: "BT",
    slNumber: "T730215",
    dateOfPurchase: "2022-06-10",
    invoiceNo: "INV/2022/089",
    unitReceivedDateAtStation: "2022-07-05",
    dateOfCommission: "2022-07-20",
    dateOfOPS: "2022-08-01",
    remarks: "New unit, excellent condition",
  },
  {
    slNo: "4",
    date: "2023-08-20",
    station: "Jalgaon",
    gseName: "PASSENGER STAIRS",
    gseNumber: "GFHS/JLG/PS/01",
    gseCategory: "PS",
    slNumber: "T735420",
    dateOfPurchase: "2022-07-15",
    invoiceNo: "INV/2022/112",
    unitReceivedDateAtStation: "2022-08-10",
    dateOfCommission: "2022-08-25",
    dateOfOPS: "2022-09-05",
    remarks: "Hydraulic system checked",
  },
  {
    slNo: "5",
    date: "2023-09-01",
    station: "Sindhudurg",
    gseName: "GROUND POWER UNIT GPU - AC/DC",
    gseNumber: "GFHS/SDG/GPU/01",
    gseCategory: "GPU",
    slNumber: "T740101",
    dateOfPurchase: "2022-08-20",
    invoiceNo: "INV/2022/145",
    unitReceivedDateAtStation: "2022-09-15",
    dateOfCommission: "2022-09-30",
    dateOfOPS: "2022-10-10",
    remarks: "Coastal area, anti-corrosion coating applied",
  },
  {
    slNo: "6",
    date: "2023-09-10",
    station: "Aurangabad",
    gseName: "BELT LOADER",
    gseNumber: "GFHS/AUR/BL/01",
    gseCategory: "BL",
    slNumber: "T745210",
    dateOfPurchase: "2022-09-05",
    invoiceNo: "INV/2022/178",
    unitReceivedDateAtStation: "2022-10-01",
    dateOfCommission: "2022-10-15",
    dateOfOPS: "2022-10-25",
    remarks: "Heavy duty model",
  },
  {
    slNo: "7",
    date: "2023-09-20",
    station: "Hubli",
    gseName: "AIR CONDITIONING UNIT - ACU",
    gseNumber: "GFHS/HBX/ACU/01",
    gseCategory: "ACU",
    slNumber: "T750320",
    dateOfPurchase: "2022-10-10",
    invoiceNo: "INV/2022/201",
    unitReceivedDateAtStation: "2022-11-05",
    dateOfCommission: "2022-11-20",
    dateOfOPS: "2022-12-01",
    remarks: "High capacity unit",
  },
  {
    slNo: "8",
    date: "2023-10-01",
    station: "Belagavi",
    gseName: "PUSHBACK TRACTOR",
    gseNumber: "GFHS/BLV/PT/01",
    gseCategory: "PT",
    slNumber: "T755401",
    dateOfPurchase: "2022-11-15",
    invoiceNo: "INV/2022/234",
    unitReceivedDateAtStation: "2022-12-10",
    dateOfCommission: "2022-12-25",
    dateOfOPS: "2023-01-05",
    remarks: "Towbar included",
  },
  {
    slNo: "9",
    date: "2023-10-10",
    station: "Shivamogga",
    gseName: "BAGGAGE TRACTOR",
    gseNumber: "GFHS/SHM/BT/01",
    gseCategory: "BT",
    slNumber: "T760510",
    dateOfPurchase: "2022-12-20",
    invoiceNo: "INV/2022/267",
    unitReceivedDateAtStation: "2023-01-15",
    dateOfCommission: "2023-01-30",
    dateOfOPS: "2023-02-10",
    remarks: "Diesel engine, fuel efficient",
  },
  {
    slNo: "10",
    date: "2023-10-20",
    station: "Ayodhya",
    gseName: "GROUND POWER UNIT GPU - AC/DC",
    gseNumber: "GFHS/AYD/GPU/01",
    gseCategory: "GPU",
    slNumber: "T765620",
    dateOfPurchase: "2023-01-25",
    invoiceNo: "INV/2023/012",
    unitReceivedDateAtStation: "2023-02-20",
    dateOfCommission: "2023-03-05",
    dateOfOPS: "2023-03-15",
    remarks: "New airport facility",
  },
  {
    slNo: "11",
    date: "2023-11-01",
    station: "Kishangarh",
    gseName: "PASSENGER STAIRS",
    gseNumber: "GFHS/KSG/PS/01",
    gseCategory: "PS",
    slNumber: "T770701",
    dateOfPurchase: "2023-02-28",
    invoiceNo: "INV/2023/045",
    unitReceivedDateAtStation: "2023-03-25",
    dateOfCommission: "2023-04-10",
    dateOfOPS: "2023-04-20",
    remarks: "Adjustable height feature",
  },
  {
    slNo: "12",
    date: "2023-11-10",
    station: "Jabalpur",
    gseName: "BELT LOADER",
    gseNumber: "GFHS/JBP/BL/01",
    gseCategory: "BL",
    slNumber: "T775810",
    dateOfPurchase: "2023-03-15",
    invoiceNo: "INV/2023/078",
    unitReceivedDateAtStation: "2023-04-10",
    dateOfCommission: "2023-04-25",
    dateOfOPS: "2023-05-05",
    remarks: "Electric motor, low noise",
  },
  {
    slNo: "13",
    date: "2023-11-20",
    station: "Khajuraho",
    gseName: "AIR CONDITIONING UNIT - ACU",
    gseNumber: "GFHS/KJH/ACU/01",
    gseCategory: "ACU",
    slNumber: "T780920",
    dateOfPurchase: "2023-04-20",
    invoiceNo: "INV/2023/112",
    unitReceivedDateAtStation: "2023-05-15",
    dateOfCommission: "2023-05-30",
    dateOfOPS: "2023-06-10",
    remarks: "Tourist season ready",
  },
  {
    slNo: "14",
    date: "2023-12-01",
    station: "Dimapur",
    gseName: "GROUND POWER UNIT GPU - AC/DC",
    gseNumber: "GFHS/DMU/GPU/01",
    gseCategory: "GPU",
    slNumber: "T786001",
    dateOfPurchase: "2023-05-25",
    invoiceNo: "INV/2023/145",
    unitReceivedDateAtStation: "2023-06-20",
    dateOfCommission: "2023-07-05",
    dateOfOPS: "2023-07-15",
    remarks: "Northeast region deployment",
  },
  {
    slNo: "15",
    date: "2023-12-10",
    station: "Raipur",
    gseName: "PUSHBACK TRACTOR",
    gseNumber: "GFHS/RPR/PT/01",
    gseCategory: "PT",
    slNumber: "T791110",
    dateOfPurchase: "2023-06-30",
    invoiceNo: "INV/2023/178",
    unitReceivedDateAtStation: "2023-07-25",
    dateOfCommission: "2023-08-10",
    dateOfOPS: "2023-08-20",
    remarks: "High torque model",
  },
  {
    slNo: "16",
    date: "2023-12-20",
    station: "Visakhapatnam",
    gseName: "BAGGAGE TRACTOR",
    gseNumber: "GFHS/VTZ/BT/01",
    gseCategory: "BT",
    slNumber: "T796220",
    dateOfPurchase: "2023-07-15",
    invoiceNo: "INV/2023/201",
    unitReceivedDateAtStation: "2023-08-10",
    dateOfCommission: "2023-08-25",
    dateOfOPS: "2023-09-05",
    remarks: "Coastal operations certified",
  },
  {
    slNo: "17",
    date: "2024-01-05",
    station: "Patna",
    gseName: "PASSENGER STAIRS",
    gseNumber: "GFHS/PAT/PS/01",
    gseCategory: "PS",
    slNumber: "T801305",
    dateOfPurchase: "2023-08-20",
    invoiceNo: "INV/2023/234",
    unitReceivedDateAtStation: "2023-09-15",
    dateOfCommission: "2023-09-30",
    dateOfOPS: "2023-10-10",
    remarks: "Wide body aircraft compatible",
  },
  {
    slNo: "18",
    date: "2024-01-15",
    station: "Shimla",
    gseName: "GROUND POWER UNIT GPU - AC/DC",
    gseNumber: "GFHS/SLV/GPU/01",
    gseCategory: "GPU",
    slNumber: "T806415",
    dateOfPurchase: "2023-09-25",
    invoiceNo: "INV/2023/267",
    unitReceivedDateAtStation: "2023-10-20",
    dateOfCommission: "2023-11-05",
    dateOfOPS: "2023-11-15",
    remarks: "Cold weather operations certified",
  },
  {
    slNo: "19",
    date: "2024-01-25",
    station: "Ludhiana",
    gseName: "BELT LOADER",
    gseNumber: "GFHS/LUH/BL/01",
    gseCategory: "BL",
    slNumber: "T811525",
    dateOfPurchase: "2023-10-30",
    invoiceNo: "INV/2023/301",
    unitReceivedDateAtStation: "2023-11-25",
    dateOfCommission: "2023-12-10",
    dateOfOPS: "2023-12-20",
    remarks: "Heavy cargo capacity",
  },
  {
    slNo: "20",
    date: "2024-02-05",
    station: "Surat",
    gseName: "AIR CONDITIONING UNIT - ACU",
    gseNumber: "GFHS/STV/ACU/01",
    gseCategory: "ACU",
    slNumber: "T816605",
    dateOfPurchase: "2023-11-15",
    invoiceNo: "INV/2023/334",
    unitReceivedDateAtStation: "2023-12-10",
    dateOfCommission: "2023-12-25",
    dateOfOPS: "2024-01-05",
    remarks: "Energy efficient model",
  },
  {
    slNo: "21",
    date: "2024-02-15",
    station: "Bhavnagar",
    gseName: "PUSHBACK TRACTOR",
    gseNumber: "GFHS/BHU/PT/01",
    gseCategory: "PT",
    slNumber: "T821715",
    dateOfPurchase: "2023-12-20",
    invoiceNo: "INV/2023/367",
    unitReceivedDateAtStation: "2024-01-15",
    dateOfCommission: "2024-01-30",
    dateOfOPS: "2024-02-10",
    remarks: "Automatic transmission",
  },
  {
    slNo: "22",
    date: "2024-02-25",
    station: "Rajkot",
    gseName: "BAGGAGE TRACTOR",
    gseNumber: "GFHS/RAJ/BT/01",
    gseCategory: "BT",
    slNumber: "T826825",
    dateOfPurchase: "2024-01-25",
    invoiceNo: "INV/2024/012",
    unitReceivedDateAtStation: "2024-02-20",
    dateOfCommission: "2024-03-05",
    dateOfOPS: "2024-03-15",
    remarks: "Multi-cart towing capability",
  },
  {
    slNo: "23",
    date: "2024-03-05",
    station: "Tirupati",
    gseName: "GROUND POWER UNIT GPU - AC/DC",
    gseNumber: "GFHS/TIR/GPU/01",
    gseCategory: "GPU",
    slNumber: "T831905",
    dateOfPurchase: "2024-02-10",
    invoiceNo: "INV/2024/045",
    unitReceivedDateAtStation: "2024-03-05",
    dateOfCommission: "2024-03-20",
    dateOfOPS: "2024-03-30",
    remarks: "Pilgrimage season ready",
  },
  {
    slNo: "24",
    date: "2024-03-15",
    station: "Mysore",
    gseName: "PASSENGER STAIRS",
    gseNumber: "GFHS/MYQ/PS/01",
    gseCategory: "PS",
    slNumber: "T837015",
    dateOfPurchase: "2024-02-28",
    invoiceNo: "INV/2024/078",
    unitReceivedDateAtStation: "2024-03-25",
    dateOfCommission: "2024-04-10",
    dateOfOPS: "2024-04-20",
    remarks: "Tourism hub deployment",
  },
]

export function CommissioningDashboard() {
  const { equipment, addEquipment, deleteEquipment, updateEquipment } = useEquipment()
  const [filteredEquipment, setFilteredEquipment] = useState(equipment)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null)
  const [stationFilter, setStationFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const { toast } = useToast()

  const [newEquipment, setNewEquipment] = useState<Equipment>({
    slNo: "",
    date: "",
    station: "",
    gseName: "",
    gseNumber: "",
    gseCategory: "",
    slNumber: "",
    dateOfPurchase: "",
    invoiceNo: "",
    unitReceivedDateAtStation: "",
    dateOfCommission: "",
    dateOfOPS: "",
    remarks: "",
  })

  const uniqueStations = Array.from(new Set(equipment.map((eq) => eq.station)))
  const uniqueCategories = Array.from(new Set(equipment.map((eq) => eq.gseCategory).filter(Boolean)))

  const handleAddEquipment = () => {
    if (newEquipment.station && newEquipment.gseName && newEquipment.gseNumber) {
      addEquipment({ ...newEquipment, slNo: String(equipment.length + 1) })
      setNewEquipment({
        slNo: "",
        date: "",
        station: "",
        gseName: "",
        gseNumber: "",
        gseCategory: "",
        slNumber: "",
        dateOfPurchase: "",
        invoiceNo: "",
        unitReceivedDateAtStation: "",
        dateOfCommission: "",
        dateOfOPS: "",
        remarks: "",
      })
      setIsAddModalOpen(false)
      toast({
        title: "Equipment Added",
        description: "New equipment has been added and is now available in all modules.",
      })
    } else {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in Station, GSE Name, and GSE Number.",
        variant: "destructive",
      })
    }
  }

  const handleEditEquipment = (equipment: Equipment) => {
    setEditingEquipment({ ...equipment })
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = () => {
    if (editingEquipment && editingEquipment.station && editingEquipment.gseName && editingEquipment.gseNumber) {
      updateEquipment(editingEquipment.gseNumber, editingEquipment)
      setIsEditModalOpen(false)
      setEditingEquipment(null)
      toast({
        title: "Equipment Updated",
        description: "Equipment details have been updated across all modules.",
      })
    } else {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in Station, GSE Name, and GSE Number.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteEquipment = (gseNumber: string) => {
    if (confirm(`Are you sure you want to delete equipment ${gseNumber}? This will remove it from all modules.`)) {
      deleteEquipment(gseNumber)
      toast({
        title: "Equipment Deleted",
        description: "Equipment has been removed from all modules.",
      })
    }
  }

  const applyFilters = () => {
    let filtered = equipment

    if (stationFilter !== "all") {
      filtered = filtered.filter((eq) => eq.station === stationFilter)
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((eq) => eq.gseCategory === categoryFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter((eq) =>
        Object.values(eq).some((value) => value.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    setFilteredEquipment(filtered)
    setCurrentPage(1)
  }

  useEffect(() => {
    applyFilters()
  }, [stationFilter, categoryFilter, searchTerm, equipment])

  const totalPages = Math.ceil(filteredEquipment.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEquipment = filteredEquipment.slice(startIndex, startIndex + itemsPerPage)

  const exportToCSV = () => {
    const headers = [
      "SL No",
      "Date",
      "Station",
      "GSE Name",
      "GSE Number",
      "GSE Category",
      "SL Number",
      "Date of Purchase",
      "Invoice No",
      "Unit Received Date at Station",
      "Date of Commission",
      "Date of OPS",
      "Remarks",
    ]

    const csvContent = [
      headers.join(","),
      ...filteredEquipment.map((item) =>
        [
          item.slNo,
          item.date,
          item.station,
          `"${item.gseName}"`,
          item.gseNumber,
          item.gseCategory,
          item.slNumber,
          item.dateOfPurchase,
          item.invoiceNo,
          item.unitReceivedDateAtStation,
          item.dateOfCommission,
          item.dateOfOPS,
          `"${item.remarks}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `equipment-inventory-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "CSV Export Complete",
      description: `Exported ${filteredEquipment.length} equipment records to CSV.`,
    })
  }

  const exportToPDF = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Equipment Inventory Report</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #374151;
              padding-bottom: 20px;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #374151;
              margin-bottom: 5px;
            }
            .report-title {
              font-size: 18px;
              color: #f97316;
              margin-bottom: 10px;
            }
            .report-info {
              font-size: 12px;
              color: #666;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              font-size: 9px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 6px; 
              text-align: left; 
            }
            th { 
              background-color: #f8fafc; 
              font-weight: bold;
              color: #374151;
            }
            tr:nth-child(even) { 
              background-color: #f9fafb; 
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 10px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            @page {
              size: landscape;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">GLOBAL Flight Handling Services</div>
            <div class="report-title">Equipment Inventory Report</div>
            <div class="report-info">
              Generated on: ${new Date().toLocaleDateString()} | 
              Total Records: ${filteredEquipment.length}
              ${stationFilter !== "all" ? ` | Filtered by: ${stationFilter}` : ""}
              ${categoryFilter !== "all" ? ` | Category: ${categoryFilter}` : ""}
              ${searchTerm ? ` | Search: "${searchTerm}"` : ""}
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>SL No</th>
                <th>Date</th>
                <th>Station</th>
                <th>GSE Name</th>
                <th>GSE Number</th>
                <th>GSE Category</th>
                <th>SL Number</th>
                <th>Date of Purchase</th>
                <th>Invoice No</th>
                <th>Unit Received Date</th>
                <th>Date of Commission</th>
                <th>Date of OPS</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEquipment
                .map(
                  (item) => `
                <tr>
                  <td>${item.slNo}</td>
                  <td>${item.date ? new Date(item.date).toLocaleDateString() : "-"}</td>
                  <td>${item.station}</td>
                  <td>${item.gseName}</td>
                  <td>${item.gseNumber}</td>
                  <td>${item.gseCategory}</td>
                  <td>${item.slNumber}</td>
                  <td>${item.dateOfPurchase ? new Date(item.dateOfPurchase).toLocaleDateString() : "-"}</td>
                  <td>${item.invoiceNo}</td>
                  <td>${item.unitReceivedDateAtStation ? new Date(item.unitReceivedDateAtStation).toLocaleDateString() : "-"}</td>
                  <td>${item.dateOfCommission ? new Date(item.dateOfCommission).toLocaleDateString() : "-"}</td>
                  <td>${item.dateOfOPS ? new Date(item.dateOfOPS).toLocaleDateString() : "-"}</td>
                  <td>${item.remarks || "-"}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="footer">
            <p>This report was generated automatically by the Equipment Management System.</p>
            <p>© ${new Date().getFullYear()} GLOBAL Flight Handling Services. All rights reserved.</p>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()

    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)

    toast({
      title: "PDF Export Initiated",
      description: `Generating PDF report with ${filteredEquipment.length} equipment records.`,
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between bg-white px-4 py-3 rounded-lg">
        <div className="flex flex-wrap gap-2">
          <Select value={stationFilter} onValueChange={setStationFilter}>
            <SelectTrigger className="w-full sm:w-40 h-9 text-sm border-border/50">
              <SelectValue placeholder="Department" />
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
              <SelectValue placeholder="GSE Category" />
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

          <Input
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 h-9 text-sm border-border/50"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 h-9 text-sm shadow-sm">
                <PlusIcon />
                <span className="ml-2">Add Equipment</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">Add New Equipment</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEquipment.date}
                    onChange={(e) => setNewEquipment({ ...newEquipment, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="station">Station *</Label>
                  <Input
                    id="station"
                    value={newEquipment.station}
                    onChange={(e) => setNewEquipment({ ...newEquipment, station: e.target.value })}
                    placeholder="e.g., PAT"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="gseName">GSE Name *</Label>
                  <Input
                    id="gseName"
                    value={newEquipment.gseName}
                    onChange={(e) => setNewEquipment({ ...newEquipment, gseName: e.target.value })}
                    placeholder="e.g., GROUND POWER UNIT GPU - AC/DC"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gseNumber">GSE Number *</Label>
                  <Input
                    id="gseNumber"
                    value={newEquipment.gseNumber}
                    onChange={(e) => setNewEquipment({ ...newEquipment, gseNumber: e.target.value })}
                    placeholder="e.g., GFHS/PAT/GPU/01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gseCategory">GSE Category</Label>
                  <Input
                    id="gseCategory"
                    value={newEquipment.gseCategory}
                    onChange={(e) => setNewEquipment({ ...newEquipment, gseCategory: e.target.value })}
                    placeholder="e.g., GPU"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slNumber">SL Number</Label>
                  <Input
                    id="slNumber"
                    value={newEquipment.slNumber}
                    onChange={(e) => setNewEquipment({ ...newEquipment, slNumber: e.target.value })}
                    placeholder="e.g., T718811"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfPurchase">Date of Purchase</Label>
                  <Input
                    id="dateOfPurchase"
                    type="date"
                    value={newEquipment.dateOfPurchase}
                    onChange={(e) => setNewEquipment({ ...newEquipment, dateOfPurchase: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceNo">Invoice No</Label>
                  <Input
                    id="invoiceNo"
                    value={newEquipment.invoiceNo}
                    onChange={(e) => setNewEquipment({ ...newEquipment, invoiceNo: e.target.value })}
                    placeholder="e.g., 7/01/2022"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitReceivedDateAtStation">Unit Received Date at Station</Label>
                  <Input
                    id="unitReceivedDateAtStation"
                    type="date"
                    value={newEquipment.unitReceivedDateAtStation}
                    onChange={(e) => setNewEquipment({ ...newEquipment, unitReceivedDateAtStation: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfCommission">Date of Commission</Label>
                  <Input
                    id="dateOfCommission"
                    type="date"
                    value={newEquipment.dateOfCommission}
                    onChange={(e) => setNewEquipment({ ...newEquipment, dateOfCommission: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfOPS">Date of OPS</Label>
                  <Input
                    id="dateOfOPS"
                    type="date"
                    value={newEquipment.dateOfOPS}
                    onChange={(e) => setNewEquipment({ ...newEquipment, dateOfOPS: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={newEquipment.remarks}
                    onChange={(e) => setNewEquipment({ ...newEquipment, remarks: e.target.value })}
                    placeholder="Enter any additional remarks..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEquipment} className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Add Equipment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-sm shadow-none"
            onClick={exportToCSV}
          >
            Export CSV
          </Button>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-sm shadow-none"
            onClick={exportToPDF}
          >
            Export PDF
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20 hover:bg-muted/20 border-b border-border/30">
                <TableHead className="font-semibold text-xs h-9 text-muted-foreground uppercase">SL No</TableHead>
                <TableHead className="font-semibold text-xs h-9 text-muted-foreground uppercase">Date</TableHead>
                <TableHead className="font-semibold text-xs h-9 text-muted-foreground uppercase">Station</TableHead>
                <TableHead className="font-semibold text-xs h-9 text-muted-foreground uppercase">GSE Name</TableHead>
                <TableHead className="font-semibold text-xs h-9 text-muted-foreground uppercase">GSE Number</TableHead>
                <TableHead className="font-semibold text-xs h-9 text-muted-foreground uppercase">
                  GSE Category
                </TableHead>
                <TableHead className="font-semibold text-xs h-9 text-muted-foreground uppercase">SL Number</TableHead>
                <TableHead className="font-semibold text-xs h-9 text-muted-foreground uppercase">
                  Date of Purchase
                </TableHead>
                <TableHead className="font-semibold text-xs h-9 text-muted-foreground uppercase">Invoice No</TableHead>
                <TableHead className="font-semibold text-xs h-9 text-muted-foreground uppercase">
                  Unit Received Date at Station
                </TableHead>
                <TableHead className="font-semibold text-xs h-9 text-muted-foreground uppercase">
                  Date of Commission
                </TableHead>
                <TableHead className="font-semibold text-xs h-9 text-muted-foreground uppercase">Date of OPS</TableHead>
                <TableHead className="font-semibold text-xs h-9 text-muted-foreground uppercase">Remarks</TableHead>
                <TableHead className="font-semibold text-xs h-9 text-muted-foreground uppercase">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEquipment.length > 0 ? (
                paginatedEquipment.map((item, index) => (
                  <TableRow key={`${item.gseNumber}-${index}`} className="hover:bg-muted/10 border-b border-border/20">
                    <TableCell className="text-sm py-2.5">{item.slNo}</TableCell>
                    <TableCell className="text-sm py-2.5">
                      {item.date ? new Date(item.date).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell className="text-sm py-2.5">{item.station}</TableCell>
                    <TableCell className="text-sm py-2.5">{item.gseName}</TableCell>
                    <TableCell className="text-sm py-2.5">{item.gseNumber}</TableCell>
                    <TableCell className="text-sm py-2.5">{item.gseCategory}</TableCell>
                    <TableCell className="text-sm py-2.5">{item.slNumber}</TableCell>
                    <TableCell className="text-sm py-2.5">
                      {item.dateOfPurchase ? new Date(item.dateOfPurchase).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell className="text-sm py-2.5">{item.invoiceNo || "-"}</TableCell>
                    <TableCell className="text-sm py-2.5">
                      {item.unitReceivedDateAtStation
                        ? new Date(item.unitReceivedDateAtStation).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell className="text-sm py-2.5">
                      {item.dateOfCommission ? new Date(item.dateOfCommission).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell className="text-sm py-2.5">
                      {item.dateOfOPS ? new Date(item.dateOfOPS).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell className="text-sm py-2.5">{item.remarks || "-"}</TableCell>
                    <TableCell className="text-sm py-2.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditEquipment(item)}
                        className="h-7 text-xs"
                      >
                        <PencilIcon />
                        <span className="ml-1">Edit</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={14} className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">No records found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/20 bg-muted/5">
            <div className="text-xs text-muted-foreground">
              {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredEquipment.length)} of{" "}
              {filteredEquipment.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-8 px-3 text-xs"
              >
                <ChevronLeftIcon />
                <span className="ml-1">Previous</span>
              </Button>
              <div className="text-xs text-muted-foreground px-2">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-3 text-xs"
              >
                <span className="mr-1">Next</span>
                <ChevronRightIcon />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Equipment</DialogTitle>
          </DialogHeader>
          {editingEquipment && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editingEquipment.date}
                  onChange={(e) => setEditingEquipment({ ...editingEquipment, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-station">Station *</Label>
                <Input
                  id="edit-station"
                  value={editingEquipment.station}
                  onChange={(e) => setEditingEquipment({ ...editingEquipment, station: e.target.value })}
                  placeholder="e.g., PAT"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-gseName">GSE Name *</Label>
                <Input
                  id="edit-gseName"
                  value={editingEquipment.gseName}
                  onChange={(e) => setEditingEquipment({ ...editingEquipment, gseName: e.target.value })}
                  placeholder="e.g., GROUND POWER UNIT GPU - AC/DC"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-gseNumber">GSE Number *</Label>
                <Input
                  id="edit-gseNumber"
                  value={editingEquipment.gseNumber}
                  onChange={(e) => setEditingEquipment({ ...editingEquipment, gseNumber: e.target.value })}
                  placeholder="e.g., GFHS/PAT/GPU/01"
                  required
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-gseCategory">GSE Category</Label>
                <Input
                  id="edit-gseCategory"
                  value={editingEquipment.gseCategory}
                  onChange={(e) => setEditingEquipment({ ...editingEquipment, gseCategory: e.target.value })}
                  placeholder="e.g., GPU"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-slNumber">SL Number</Label>
                <Input
                  id="edit-slNumber"
                  value={editingEquipment.slNumber}
                  onChange={(e) => setEditingEquipment({ ...editingEquipment, slNumber: e.target.value })}
                  placeholder="e.g., T718811"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dateOfPurchase">Date of Purchase</Label>
                <Input
                  id="edit-dateOfPurchase"
                  type="date"
                  value={editingEquipment.dateOfPurchase}
                  onChange={(e) => setEditingEquipment({ ...editingEquipment, dateOfPurchase: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-invoiceNo">Invoice No</Label>
                <Input
                  id="edit-invoiceNo"
                  value={editingEquipment.invoiceNo}
                  onChange={(e) => setEditingEquipment({ ...editingEquipment, invoiceNo: e.target.value })}
                  placeholder="e.g., 7/01/2022"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unitReceivedDateAtStation">Unit Received Date at Station</Label>
                <Input
                  id="edit-unitReceivedDateAtStation"
                  type="date"
                  value={editingEquipment.unitReceivedDateAtStation}
                  onChange={(e) =>
                    setEditingEquipment({ ...editingEquipment, unitReceivedDateAtStation: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dateOfCommission">Date of Commission</Label>
                <Input
                  id="edit-dateOfCommission"
                  type="date"
                  value={editingEquipment.dateOfCommission}
                  onChange={(e) => setEditingEquipment({ ...editingEquipment, dateOfCommission: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dateOfOPS">Date of OPS</Label>
                <Input
                  id="edit-dateOfOPS"
                  type="date"
                  value={editingEquipment.dateOfOPS}
                  onChange={(e) => setEditingEquipment({ ...editingEquipment, dateOfOPS: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-remarks">Remarks</Label>
                <Textarea
                  id="edit-remarks"
                  value={editingEquipment.remarks}
                  onChange={(e) => setEditingEquipment({ ...editingEquipment, remarks: e.target.value })}
                  placeholder="Enter any additional remarks..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-accent text-accent-foreground hover:bg-accent/90">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
