import { DashboardShell } from '@/components/dashboard/DashboardShell'

export default function SeekerLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="SEEKER">{children}</DashboardShell>
}
