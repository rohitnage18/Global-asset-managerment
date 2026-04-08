"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const { user, login, managers, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/")
    }
  }, [isLoading, user, router])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const result = login(email, password)
    if (!result.ok) {
      toast({
        title: "Login Failed",
        description: result.message ?? "Please check your credentials and try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    toast({
      title: "Login Successful",
      description: "Welcome to the Xenvolt Station Manager dashboard.",
      variant: "success",
    })
    router.replace("/")
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/images/login-bg.png')" }}
    >
      <div className="absolute inset-0 bg-black/45" />
      <Card className="w-full max-w-md shadow-xl border-white/20 bg-white/95 backdrop-blur-sm relative z-10">
        <CardHeader className="space-y-3">
          <div className="flex justify-center">
            <Image src="/images/xenvolt-logo.png" alt="Xenvolt" width={300} height={90} className="h-16 w-auto" priority />
          </div>
          <CardTitle className="text-center text-2xl">Station Manager Login</CardTitle>
          <CardDescription className="text-center">
            Login to update daily operations, fuel, and service records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="station.manager@xenvolt.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 rounded-md border bg-muted/40 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Demo station manager accounts:</p>
            <ul className="text-xs space-y-1 text-muted-foreground">
              {managers.map((manager) => (
                <li key={manager.id}>
                  {manager.station}: {manager.email}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground mt-2">Use the station password format: `Station@123`</p>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
