import { useState } from "react"
import { useLocation } from "wouter"
import { motion } from "framer-motion"
import { BrainCircuit, Lock, Mail, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminLogin() {
  const [, setLocation] = useLocation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (res.ok) {
        setLocation("/admin/dashboard")
      } else {
        const data = (await res.json()) as { error?: string }
        setError(data.error ?? "Invalid credentials")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
            <BrainCircuit className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">DevContext Analytics</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-white/5 rounded-2xl p-6 shadow-xl space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                className="w-full bg-secondary/30 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-secondary/30 border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-400 text-center"
            >
              {error}
            </motion.p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
