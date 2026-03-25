import { useEffect } from "react"
import { useLocation } from "wouter"
import { motion } from "framer-motion"
import { Github, BrainCircuit, Zap, Code2, GitMerge } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useGetMe } from "@workspace/api-client-react"

export default function Landing() {
  const [, setLocation] = useLocation()
  const { data: user, isLoading } = useGetMe({ query: { retry: false } })

  useEffect(() => {
    if (user && !isLoading) {
      setLocation("/dashboard")
    }
  }, [user, isLoading, setLocation])

  if (isLoading) return null // Let it seamlessly transition if already authed

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background with Grid and Mesh */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          alt="Abstract dark mode geometric mesh" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
            <BrainCircuit className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">DevContext</span>
        </div>
        <Button variant="glass" onClick={() => window.location.href = "/api/auth/github"}>
          Sign In
        </Button>
      </nav>

      {/* Hero Content */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            <span>AI-Powered Developer Assistant</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 leading-tight">
            Resume your code brain <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent text-glow">
              in seconds.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Instantly understand what you were working on before the weekend. We analyze your recent GitHub commits and generate a clear summary with smart next steps.
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Button 
              size="lg" 
              onClick={() => window.location.href = "/api/auth/github"}
              className="gap-3 text-lg h-14 px-8"
            >
              <Github className="w-6 h-6" />
              Connect GitHub to Start
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Free to use • No API key required
            </p>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-24">
          {[
            {
              icon: <GitMerge className="w-6 h-6 text-primary" />,
              title: "Context Rebuilt",
              desc: "Analyzes recent changes across branches to build a mental map."
            },
            {
              icon: <BrainCircuit className="w-6 h-6 text-accent" />,
              title: "AI Summaries",
              desc: "Translates cryptic diffs into plain-english task descriptions."
            },
            {
              icon: <Code2 className="w-6 h-6 text-emerald-400" />,
              title: "Smart Next Steps",
              desc: "Predicts what you should code next based on current momentum."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
              className="glass-panel rounded-2xl p-6 text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
      
      <footer className="relative z-10 py-8 text-center text-muted-foreground text-sm border-t border-white/5 mt-12">
        <p>Built with Replit AI</p>
      </footer>
    </div>
  )
}
