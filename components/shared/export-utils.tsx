"use client"

import jsPDF from "jspdf"
import "jspdf-autotable"

export function exportCSV(filename: string, rows: any[]) {
  if (!rows?.length) return
  const headers = Object.keys(rows[0])
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(","))].join(
    "\n",
  )
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.csv`
  link.click()
}

export function exportPDF(filename: string, rows: any[]) {
  if (!rows?.length) return
  const doc = new jsPDF()
  const headers = Object.keys(rows[0])
  // @ts-ignore - plugin augments doc
  doc.autoTable({
    head: [headers],
    body: rows.map((r) => headers.map((h) => r[h] ?? "")),
    styles: { fontSize: 8 },
  })
  doc.save(`${filename}.pdf`)
}
