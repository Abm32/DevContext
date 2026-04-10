import { useCallback, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"

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
  prefill: { name?: string }
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

export function useRazorpay() {
  const qc = useQueryClient()
  const openingRef = useRef(false)

  const openCheckout = useCallback(async (opts: {
    onSuccess?: () => void
    onError?: (msg: string) => void
    onDismiss?: () => void
  } = {}) => {
    if (openingRef.current) return
    openingRef.current = true

    try {
      await loadScript()

      const res = await fetch("/api/payments/create-order", { method: "POST", credentials: "include" })
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
        description: "Pro Plan — Unlimited AI · Workspaces · Compare Repos",
        order_id: order.order_id,
        image: "/images/logo.png",
        prefill: { name: order.prefill.name },
        theme: { color: "#3b82f6" },
        handler: async (response: RazorpayPaymentResponse) => {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify(response),
            })
            if (!verifyRes.ok) {
              const err = await verifyRes.json() as { error?: string }
              opts.onError?.(err.error ?? "Payment verification failed")
              return
            }
            // Invalidate plan cache so UI updates instantly
            await qc.invalidateQueries({ queryKey: ["/api/plan/me"] })
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
