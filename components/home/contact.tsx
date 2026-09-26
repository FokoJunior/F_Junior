"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, ArrowUpRight, Check, Loader2 } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { useLanguage } from "@/components/language-provider"
import { Emphasis, Reveal, SectionLabel } from "@/components/reveal"
import { useToast } from "@/hooks/use-toast"
import { site } from "@/lib/site"

const emptyForm = { name: "", email: "", subject: "", message: "" }

function Field({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="group relative">
      <label htmlFor={id} className="eyebrow block transition-colors group-focus-within:text-primary">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  "mt-2 w-full border-0 border-b border-input bg-transparent px-0 pb-3 pt-1 text-lg outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-foreground focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-50"

export default function Contact() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error)
      setForm(emptyForm)
      setSent(true)
    } catch {
      toast({ title: t("errorTitle"), description: t("sendError"), variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="container py-24 md:py-36">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-3">
          <Reveal>
            <SectionLabel index="05">{t("contact")}</SectionLabel>
          </Reveal>
        </div>
        <Reveal className="md:col-span-9">
          <h2 className="font-serif text-5xl leading-[0.95] tracking-tight md:text-8xl">
            <Emphasis text={t("letsTalk")} />
          </h2>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">{t("contactDesc")}</p>
        </Reveal>
      </div>

      <div className="mt-16 grid gap-16 md:grid-cols-12">
        <Reveal className="space-y-10 md:col-span-5 md:col-start-4 lg:col-span-4 lg:col-start-4">
          <div>
            <p className="eyebrow mb-3">{t("orWrite")}</p>
            <a
              href={`mailto:${site.email}`}
              className="link-underline break-all font-serif text-2xl md:text-3xl"
            >
              {site.email}
            </a>
          </div>
          <dl className="space-y-5 text-sm">
            <div>
              <dt className="eyebrow mb-1">{t("phone")}</dt>
              <dd className="flex flex-wrap items-center gap-3">
                <a href={site.phoneHref} className="hover:text-primary">
                  {site.phone}
                </a>
                <a
                  href={site.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chip !border-emerald-600/40 !text-emerald-700 hover:!bg-emerald-600 hover:!text-white dark:!text-emerald-400"
                >
                  WhatsApp
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </dd>
            </div>
            <div>
              <dt className="eyebrow mb-1">{t("location")}</dt>
              <dd>{t("locationValue")}</dd>
            </div>
            <div>
              <dt className="eyebrow mb-2">Social</dt>
              <dd className="flex flex-wrap gap-2">
                {Object.entries(site.socials).map(([name, href]) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="chip capitalize"
                  >
                    {name}
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                ))}
              </dd>
            </div>
          </dl>
        </Reveal>

        <Reveal delay={0.1} className="md:col-span-12 lg:col-span-5">
          <form onSubmit={onSubmit} className="grid gap-8">
            <div className="grid gap-8 sm:grid-cols-2">
              <Field id="name" label={t("name")}>
                <input
                  id="name"
                  required
                  autoComplete="name"
                  disabled={loading}
                  value={form.name}
                  onChange={onChange}
                  placeholder={t("yourName")}
                  className={inputClass}
                />
              </Field>
              <Field id="email" label={t("email")}>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  disabled={loading}
                  value={form.email}
                  onChange={onChange}
                  placeholder={t("yourEmail")}
                  className={inputClass}
                />
              </Field>
            </div>
            <Field id="subject" label={t("subject")}>
              <input
                id="subject"
                required
                disabled={loading}
                value={form.subject}
                onChange={onChange}
                placeholder={t("messageSubject")}
                className={inputClass}
              />
            </Field>
            <Field id="message" label={t("message")}>
              <textarea
                id="message"
                required
                rows={5}
                disabled={loading}
                value={form.message}
                onChange={onChange}
                placeholder={t("yourMessage")}
                className={`${inputClass} resize-none`}
              />
            </Field>
            <button type="submit" disabled={loading} className="btn btn-solid group h-14 justify-between px-7 text-base">
              {loading ? t("sending") : t("sendMessage")}
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              )}
            </button>
          </form>
        </Reveal>
      </div>

      <Dialog open={sent} onOpenChange={setSent}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-start gap-5 py-2">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 14, stiffness: 220 }}
              className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground"
            >
              <Check className="h-6 w-6" />
            </motion.span>
            <DialogTitle className="font-serif text-3xl font-normal">{t("messageSent")}</DialogTitle>
            <DialogDescription>{t("messageConfirmation")}</DialogDescription>
            <button type="button" onClick={() => setSent(false)} className="btn btn-solid mt-2">
              {t("continue")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
