import { useCallback, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import type { PlanTier } from "@/hooks/use-plan"

declare global {
  interface Window {
    Razorpay: new (opts: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  image?: string
  prefill?: { name?: string; email?: string }
  theme?: { color: string }
  handler: (response: RazorpayPaymentResponse) => void
  modal?: { ondismiss?: () => void }
}

interface RazorpayInstance {
  open: () => void
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface CreateOrderResponse {
  order_id: string
  amount: number
  currency: string
  key_id: string
  plan: string
  plan_label: string
  prefill: { name?: string }
}

const PLAN_DESCRIPTIONS: Record<Exclude<PlanTier, "free">, string> = {
  plus: "Plus Plan — 100 AI analyses · 3 repos · Compare Mode",
  pro: "Pro Plan — 500 AI analyses · 10 repos · All features",
  team: "Team Plan — 2,000 AI analyses · Unlimited repos · Team sharing",
}

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) { resolve(); return }
    const s = document.createElement("script")
    s.src = "https://checkout.razorpay.com/v1/checkout.js"
    s.onload = () => resolve()
    s.onerror = () => reject(new Error("Failed to load Razorpay"))
    document.head.appendChild(s)
  })
}

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? ""

export function useRazorpay() {
  const qc = useQueryClient()
  const openingRef = useRef(false)

  const openCheckout = useCallback(async (opts: {
    plan?: Exclude<PlanTier, "free">
    onSuccess?: () => void
    onError?: (msg: string) => void
    onDismiss?: () => void
  } = {}) => {
    if (openingRef.current) return
    openingRef.current = true

    const targetPlan = opts.plan ?? "pro"

    try {
      await loadScript()

      const res = await fetch(`${BASE}/api/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plan: targetPlan }),
      })
      if (!res.ok) {
        const err = await res.json() as { error?: string }
        opts.onError?.(err.error ?? "Failed to initiate payment")
        return
      }
      const order = await res.json() as CreateOrderResponse

      const rzp = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "DevContext",
        description: PLAN_DESCRIPTIONS[targetPlan],
        order_id: order.order_id,
        image: `${BASE}/images/logo.png`,
        prefill: { name: order.prefill.name },
        theme: { color: "#3b82f6" },
        handler: async (response: RazorpayPaymentResponse) => {
          try {
            const verifyRes = await fetch(`${BASE}/api/payments/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ ...response, plan: targetPlan }),
            })
            if (!verifyRes.ok) {
              const err = await verifyRes.json() as { error?: string }
              opts.onError?.(err.error ?? "Payment verification failed")
              return
            }
            await qc.invalidateQueries({ queryKey: ["plan", "me"] })
            opts.onSuccess?.()
          } catch {
            opts.onError?.("Payment verification failed. Contact support if amount was deducted.")
          }
        },
        modal: {
          ondismiss: () => opts.onDismiss?.(),
        },
      })

      rzp.open()
    } catch (err) {
      opts.onError?.((err as Error).message ?? "Something went wrong")
    } finally {
      openingRef.current = false
    }
  }, [qc])

  return { openCheckout }
}
