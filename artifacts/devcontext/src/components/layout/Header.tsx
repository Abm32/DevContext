import { useGetMe, useLogout } from "@workspace/api-client-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { LogOut, Github } from "lucide-react"

export function Header() {
  const { data: user, isLoading } = useGetMe({ query: { retry: false } })
  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => {
        window.location.href = "/"
      }
    }
  })

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/images/logo.png"
            alt="DevContext logo"
            className="w-8 h-8 rounded-lg object-cover"
          />
          <span className="font-display font-bold text-lg text-white hidden sm:inline-block tracking-tight">
            DevContext
          </span>
        </div>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="w-24 h-5" />
              <Skeleton className="w-9 h-9 rounded-full" />
            </div>
          ) : user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-secondary/50 py-1.5 pl-3 pr-1.5 rounded-full border border-white/5">
                <span className="text-sm font-medium text-muted-foreground hidden sm:block">
                  {user.login}
                </span>
                <img 
                  src={user.avatar_url} 
                  alt={user.login} 
                  className="w-7 h-7 rounded-full border border-white/10"
                />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => logoutMutation.mutate()}
                isLoading={logoutMutation.isPending}
                title="Log out"
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button onClick={() => window.location.href = "/api/auth/github"} className="gap-2">
              <Github className="w-4 h-4" />
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
