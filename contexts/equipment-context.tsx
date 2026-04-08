"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface Equipment {
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

interface EquipmentContextType {
  equipment: Equipment[]
  addEquipment: (eq: Equipment) => void
  deleteEquipment: (gseNumber: string) => void
  updateEquipment: (gseNumber: string, updates: Partial<Equipment>) => void
  getEquipmentByNumber: (gseNumber: string) => Equipment | undefined
}

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined)

const sampleEquipment: Equipment[] = [
  {
    slNo: "1",
    date: "2024-01-15",
    station: "Pune",
    gseName: "GROUND POWER UNIT GPU - AC/DC",
    gseNumber: "GFHS/PNQ/GPU/01",
    gseCategory: "GPU",
    slNumber: "GPU-001",
    dateOfPurchase: "2023-12-01",
    invoiceNo: "INV-2023-001",
    unitReceivedDateAtStation: "2023-12-15",
    dateOfCommission: "2024-01-10",
    dateOfOPS: "2024-01-15",
    remarks: "Operational",
  },
  {
    slNo: "2",
    date: "2024-02-20",
    station: "Visakhapatnam",
    gseName: "AIR CONDITIONING UNIT ACU",
    gseNumber: "GFHS/VTZ/ACU/01",
    gseCategory: "ACU",
    slNumber: "ACU-001",
    dateOfPurchase: "2024-01-10",
    invoiceNo: "INV-2024-002",
    unitReceivedDateAtStation: "2024-01-25",
    dateOfCommission: "2024-02-15",
    dateOfOPS: "2024-02-20",
    remarks: "Operational",
  },
  {
    slNo: "3",
    date: "2024-03-10",
    station: "Patna",
    gseName: "PASSENGER COACH BUS PCB",
    gseNumber: "GFHS/PAT/PCB/01",
    gseCategory: "PCB",
    slNumber: "PCB-001",
    dateOfPurchase: "2024-02-01",
    invoiceNo: "INV-2024-003",
    unitReceivedDateAtStation: "2024-02-15",
    dateOfCommission: "2024-03-05",
    dateOfOPS: "2024-03-10",
    remarks: "Operational",
  },
]

export function EquipmentProvider({ children }: { children: ReactNode }) {
  const [equipment, setEquipment] = useState<Equipment[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("gfhs-equipment")
    if (stored) {
      try {
        setEquipment(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to parse stored equipment:", e)
        setEquipment(sampleEquipment)
      }
    } else {
      setEquipment(sampleEquipment)
    }
  }, [])

  // Save to localStorage whenever equipment changes
  useEffect(() => {
    if (equipment.length > 0) {
      localStorage.setItem("gfhs-equipment", JSON.stringify(equipment))
    }
  }, [equipment])

  const addEquipment = (eq: Equipment) => {
    setEquipment((prev) => [...prev, eq])
  }

  const deleteEquipment = (gseNumber: string) => {
    setEquipment((prev) => prev.filter((e) => e.gseNumber !== gseNumber))
  }

  const updateEquipment = (gseNumber: string, updates: Partial<Equipment>) => {
    setEquipment((prev) => prev.map((e) => (e.gseNumber === gseNumber ? { ...e, ...updates } : e)))
  }

  const getEquipmentByNumber = (gseNumber: string) => {
    return equipment.find((e) => e.gseNumber === gseNumber)
  }

  return (
    <EquipmentContext.Provider
      value={{
        equipment,
        addEquipment,
        deleteEquipment,
        updateEquipment,
        getEquipmentByNumber,
      }}
    >
      {children}
    </EquipmentContext.Provider>
  )
}

export function useEquipment() {
  const context = useContext(EquipmentContext)
  if (!context) {
    throw new Error("useEquipment must be used within EquipmentProvider")
  }
  return context
}
