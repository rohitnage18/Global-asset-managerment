"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { sendEmailAction } from "@/app/actions/send-email"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const STATIONS = [
  { name: "Pune", code: "PNQ" },
  { name: "Jalgaon", code: "JLG" },
  { name: "Sindhudurg", code: "SDW" },
  { name: "Aurangabad", code: "IXU" },
  { name: "Hubli", code: "HBX" },
  { name: "Belagavi", code: "IXG" },
  { name: "Shivamogga", code: "RQY" },
  { name: "Ayodhya", code: "AYJ" },
  { name: "Kishangarh", code: "KQH" },
  { name: "Jabalpur", code: "JLR" },
  { name: "Khajuraho", code: "HJR" },
  { name: "Dimapur", code: "DMU" },
  { name: "Raipur", code: "RPR" },
  { name: "Visakhapatnam", code: "VTZ" },
  { name: "Patna", code: "PAT" },
  { name: "Shimla", code: "SLV" },
  { name: "Ludhiana", code: "LUH" },
  { name: "Surat", code: "STV" },
  { name: "Bhavnagar", code: "BHU" },
  { name: "Rajkot", code: "RAJ" },
  { name: "Tirupati", code: "TIR" },
  { name: "Mysore", code: "MYQ" },
]

type Props = {
  triggerLabel?: string
  defaultSubject?: string
  defaultBody?: string
  defaultTo?: string
  defaultStation?: string
}

export function EmailDialog({
  triggerLabel = "Send Alert",
  defaultSubject = "",
  defaultBody = "",
  defaultTo = "",
  defaultStation = "",
}: Props) {
  const { toast } = useToast()
  const [open, setOpen] = React.useState(false)
  const [to, setTo] = React.useState(defaultTo)
  const [subject, setSubject] = React.useState(defaultSubject)
  const [body, setBody] = React.useState(defaultBody)
  const [station, setStation] = React.useState(defaultStation)
  const [priority, setPriority] = React.useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM")
  const [loading, setLoading] = React.useState(false)

  async function sendEmail() {
    if (!body.trim()) {
      toast({ title: "Message required", description: "Please enter alert message.", variant: "destructive" })
      return
    }

    if (!station) {
      toast({ title: "Station required", description: "Please select a station.", variant: "destructive" })
      return
    }

    try {
      setLoading(true)

      const selectedStation = STATIONS.find((s) => s.code === station)
      const alertId = `GFHS-${station}-${Date.now().toString().slice(-6)}`
      const timestamp = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "full",
        timeStyle: "long",
      })

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background: #f3f4f6; }
    .container { max-width: 650px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 25px 30px; }
    .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .logo { font-size: 24px; font-weight: bold; letter-spacing: 1px; }
    .alert-badge { background: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
    .alert-info { background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px 30px; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px; }
    .info-item { }
    .info-label { font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 4px; }
    .info-value { font-size: 15px; color: #111827; font-weight: 600; }
    .priority-high { color: #dc2626; }
    .priority-medium { color: #f59e0b; }
    .priority-low { color: #10b981; }
    .content { padding: 30px; }
    .section-title { font-size: 13px; text-transform: uppercase; color: #6b7280; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 12px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
    .message-box { background: #f9fafb; padding: 20px; border-radius: 6px; border: 1px solid #e5e7eb; font-size: 14px; line-height: 1.8; white-space: pre-wrap; }
    .footer { background: #111827; color: #9ca3af; padding: 25px 30px; text-align: center; }
    .footer-title { color: white; font-weight: 600; font-size: 15px; margin-bottom: 8px; }
    .footer p { margin: 5px 0; font-size: 13px; }
    .footer-note { font-size: 11px; color: #6b7280; margin-top: 15px; padding-top: 15px; border-top: 1px solid #374151; }
    .station-code { background: #dc2626; color: white; padding: 2px 8px; border-radius: 3px; font-weight: 700; font-size: 13px; letter-spacing: 0.5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-top">
        <div class="logo">⚠️ GFHS ALERT SYSTEM</div>
        <div class="alert-badge">PRIORITY: ${priority}</div>
      </div>
      <h1>${subject || "Ground Fleet & Handling Services Alert"}</h1>
    </div>
    
    <div class="alert-info">
      <div style="font-size: 12px; color: #991b1b; font-weight: 600; margin-bottom: 10px;">ALERT DETAILS</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Alert ID</div>
          <div class="info-value">${alertId}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Station</div>
          <div class="info-value">${selectedStation?.name} <span class="station-code">${station}</span></div>
        </div>
        <div class="info-item">
          <div class="info-label">Priority Level</div>
          <div class="info-value priority-${priority.toLowerCase()}">${priority}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Timestamp</div>
          <div class="info-value" style="font-size: 13px;">${timestamp}</div>
        </div>
      </div>
    </div>

    <div class="content">
      <div class="section-title">📋 Alert Message</div>
      <div class="message-box">${body}</div>
    </div>

    <div class="footer">
      <div class="footer-title">Ground Fleet & Handling Services</div>
      <p>Aviation Ground Support Equipment Management</p>
      <p>24/7 Operations Monitoring & Alert System</p>
      <div class="footer-note">
        This is an automated alert from GFHS Management System. For immediate assistance, contact your station operations team.
      </div>
    </div>
  </div>
</body>
</html>`

      const result = await sendEmailAction({
        to: to && to.trim().length > 0 ? to.trim() : undefined,
        subject: `[${priority}] ${station} - ${subject || "GFHS Alert"} - ${alertId}`,
        text: `GFHS ALERT\n\nAlert ID: ${alertId}\nStation: ${selectedStation?.name} (${station})\nPriority: ${priority}\nTimestamp: ${timestamp}\n\nMessage:\n${body}`,
        html: htmlContent,
      })

      if (!result.ok) {
        throw new Error(result.error || "Email failed")
      }

      toast({
        title: "Alert sent successfully",
        description: `Alert ${alertId} has been sent to operations team.`,
      })
      setOpen(false)
      setBody(defaultBody)
      setSubject(defaultSubject)
      setTo(defaultTo)
      setStation(defaultStation)
      setPriority("MEDIUM")
    } catch (e: any) {
      toast({
        title: "Failed to send alert",
        description: e.message || "Please check your configuration.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-red-600 hover:bg-red-700">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Send Aviation Alert</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Station *</label>
              <Select value={station} onValueChange={setStation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select station" />
                </SelectTrigger>
                <SelectContent>
                  {STATIONS.map((s) => (
                    <SelectItem key={s.code} value={s.code}>
                      {s.name} ({s.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Priority Level *</label>
              <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">🔴 HIGH</SelectItem>
                  <SelectItem value="MEDIUM">🟡 MEDIUM</SelectItem>
                  <SelectItem value="LOW">🟢 LOW</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Alert Subject *</label>
            <Input
              placeholder="e.g., Equipment Service Due, Fuel Request, Safety Alert"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Alert Message *</label>
            <Textarea
              placeholder="Enter detailed alert message for operations team..."
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Recipient Email (Optional)</label>
            <Input
              placeholder="Leave empty to send to default operations team"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={sendEmail} disabled={loading} className="bg-red-600 hover:bg-red-700">
              {loading ? "Sending Alert..." : "Send Alert"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
