"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, HelpCircle, Trash2, X } from "lucide-react"

import { cn } from "@/lib/utils"

export interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "danger" | "warning" | "default"
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn>(async () => false)

export function useConfirm(): ConfirmFn {
  return useContext(ConfirmContext)
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolverRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts)
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
    })
  }, [])

  const close = useCallback((result: boolean) => {
    setOptions(null)
    if (resolverRef.current) {
      resolverRef.current(result)
      resolverRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!options) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [close, options])

  const variant = options?.variant ?? "danger"

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <AnimatePresence>
        {options && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={() => close(false)}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md overflow-hidden rounded-lg border border-border bg-card p-6 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => close(false)}
                className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-start gap-4">
                <span
                  className={cn(
                    "grid h-11 w-11 shrink-0 place-items-center rounded-md border",
                    variant === "danger" && "border-destructive/30 bg-destructive/10 text-destructive",
                    variant === "warning" && "border-amber-500/30 bg-amber-500/10 text-amber-500",
                    variant === "default" && "border-primary/30 bg-primary/10 text-primary",
                  )}
                >
                  {variant === "danger" ? (
                    <Trash2 className="h-5 w-5" />
                  ) : variant === "warning" ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : (
                    <HelpCircle className="h-5 w-5" />
                  )}
                </span>

                <div className="min-w-0 flex-1 pr-6">
                  <p className="eyebrow">
                    {variant === "danger"
                      ? "Action irréversible"
                      : variant === "warning"
                        ? "Confirmation requise"
                        : "Confirmation"}
                  </p>
                  <h2 id="confirm-dialog-title" className="mt-1 font-serif text-2xl leading-snug">
                    {options.title}
                  </h2>
                  {options.description && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {options.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => close(false)}
                  className="btn btn-outline h-10 px-5 text-xs"
                >
                  {options.cancelLabel || "Annuler"}
                </button>
                <button
                  type="button"
                  autoFocus
                  onClick={() => close(true)}
                  className={cn(
                    "btn h-10 px-5 text-xs",
                    variant === "danger" &&
                      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                    variant === "warning" && "bg-amber-500 text-slate-950 hover:bg-amber-500/90",
                    variant === "default" && "btn-solid",
                  )}
                >
                  {options.confirmLabel || "Confirmer"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  )
}
