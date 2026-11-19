import type { Metadata } from "next"

import AdminShell from "@/components/admin/admin-shell"

export const metadata: Metadata = {
  title: {
    default: "Administration",
    template: "%s · Admin | F_Junior",
  },
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
