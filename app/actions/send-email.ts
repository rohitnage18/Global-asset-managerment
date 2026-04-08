"use server"

export async function sendEmailAction(params: {
  to?: string
  subject: string
  text: string
  html: string
}): Promise<{ ok: boolean; error?: string }> {
  console.log("[v0] sendEmailAction called")

  try {
    const resendApiKey = process.env.RESEND_API_KEY

    const recipient = "rohitnage99@gmail.com" // Resend account owner - required for test mode
    const fromEmail = "onboarding@resend.dev"

    // Check if Resend API key is available
    if (!resendApiKey) {
      console.error("[v0] Missing Resend API key")
      return {
        ok: false,
        error:
          "Email service not configured. Please add RESEND_API_KEY in the Vars section. Get your free API key at resend.com/api-keys",
      }
    }

    console.log("[v0] Sending email via Resend to:", recipient)

    // Use Resend API with fetch
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `GFHS Dashboard <${fromEmail}>`,
        to: [recipient],
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[v0] Resend API error:", data)
      return {
        ok: false,
        error: data.message || "Failed to send email",
      }
    }

    console.log("[v0] Email sent successfully via Resend:", data.id)
    return { ok: true }
  } catch (error: any) {
    console.error("[v0] Email error:", error)
    return {
      ok: false,
      error: error.message || "Failed to send email",
    }
  }
}
