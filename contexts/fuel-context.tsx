"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { useAuth } from "@/contexts/auth-context"

export interface FuelReceivedEntry {
  id: string
  date: string
  station: string
  dateOfPurchase: string
  invoiceNo: string
  receivedPetrol: number
  receivedDiesel: number
  perLitrePetrolCost: number
  perLitreDieselCost: number
  totalCost: number
}

export interface FuelConsumptionEntry {
  id: string
  date: string
  station: string
  gseNumber: string
  gseName: string
  gseCategory: string
  openingHours: number
  closingHours: number
  usedHours: number
  fuelConsumptionAverage: number
  topUpDiesel: number
  topUpPetrol: number
  perLitrePetrolCost: number
  perLitreDieselCost: number
  totalCost: number
  workDoneBy: string
  supervisedBy: string
  remark: string
  balanceFuel: number
}

interface FuelContextType {
  receivedEntries: FuelReceivedEntry[]
  addReceivedEntry: (entry: Omit<FuelReceivedEntry, "id">) => void
  consumptionEntries: FuelConsumptionEntry[]
  addConsumptionEntry: (entry: Omit<FuelConsumptionEntry, "id">) => void
  getInstockPetrol: () => number
  getInstockDiesel: () => number
}

const FuelContext = createContext<FuelContextType | undefined>(undefined)

export function FuelProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [receivedEntries, setReceivedEntries] = useState<FuelReceivedEntry[]>([
    {
      id: "1",
      date: "2025-01-10",
      station: "PATNA",
      dateOfPurchase: "2025-01-10",
      invoiceNo: "INV-2025-001",
      receivedPetrol: 500,
      receivedDiesel: 1000,
      perLitrePetrolCost: 110,
      perLitreDieselCost: 105,
      totalCost: 160000,
    },
    {
      id: "2",
      date: "2025-01-12",
      station: "PATNA",
      dateOfPurchase: "2025-01-12",
      invoiceNo: "INV-2025-002",
      receivedPetrol: 300,
      receivedDiesel: 800,
      perLitrePetrolCost: 112,
      perLitreDieselCost: 106,
      totalCost: 118400,
    },
  ])

  const [consumptionEntries, setConsumptionEntries] = useState<FuelConsumptionEntry[]>([
    {
      id: "1",
      date: "2025-01-14",
      station: "PATNA",
      gseNumber: "GFHS/PAT/GPU/01",
      gseName: "GROUND POWER UNIT GPU - AC/DC",
      gseCategory: "GPU",
      openingHours: 18.6,
      closingHours: 19.8,
      usedHours: 1.2,
      fuelConsumptionAverage: 0.12,
      topUpDiesel: 10,
      topUpPetrol: 0,
      perLitrePetrolCost: 0,
      perLitreDieselCost: 105,
      totalCost: 1050,
      workDoneBy: "Technician A",
      supervisedBy: "Supervisor B",
      remark: "Regular operation",
      balanceFuel: 1790,
    },
  ])

  const normalizeStation = (value: string) => value.trim().toLowerCase()
  const isAdminUser = user?.station === "All Stations"
  const scopedReceivedEntries =
    !user || isAdminUser
      ? receivedEntries
      : receivedEntries.filter((entry) => normalizeStation(entry.station) === normalizeStation(user.station))
  const scopedConsumptionEntries =
    !user || isAdminUser
      ? consumptionEntries
      : consumptionEntries.filter((entry) => normalizeStation(entry.station) === normalizeStation(user.station))

  const addReceivedEntry = (entry: Omit<FuelReceivedEntry, "id">) => {
    const station = !user || isAdminUser ? entry.station : user.station
    const newEntry = {
      ...entry,
      station,
      id: Date.now().toString(),
    }
    setReceivedEntries((prev) => [...prev, newEntry])
  }

  const addConsumptionEntry = (entry: Omit<FuelConsumptionEntry, "id">) => {
    const station = !user || isAdminUser ? entry.station : user.station
    const newEntry = {
      ...entry,
      station,
      id: Date.now().toString(),
    }
    setConsumptionEntries((prev) => [...prev, newEntry])
  }

  const getInstockPetrol = () => {
    const totalReceived = scopedReceivedEntries.reduce((sum, entry) => sum + entry.receivedPetrol, 0)
    const totalConsumed = scopedConsumptionEntries.reduce((sum, entry) => sum + entry.topUpPetrol, 0)
    return totalReceived - totalConsumed
  }

  const getInstockDiesel = () => {
    const totalReceived = scopedReceivedEntries.reduce((sum, entry) => sum + entry.receivedDiesel, 0)
    const totalConsumed = scopedConsumptionEntries.reduce((sum, entry) => sum + entry.topUpDiesel, 0)
    return totalReceived - totalConsumed
  }

  return (
    <FuelContext.Provider
      value={{
        receivedEntries: scopedReceivedEntries,
        addReceivedEntry,
        consumptionEntries: scopedConsumptionEntries,
        addConsumptionEntry,
        getInstockPetrol,
        getInstockDiesel,
      }}
    >
      {children}
    </FuelContext.Provider>
  )
}

export function useFuel() {
  const context = useContext(FuelContext)
  if (!context) {
    throw new Error("useFuel must be used within FuelProvider")
  }
  return context
}
