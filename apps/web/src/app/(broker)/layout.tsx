import { DashboardShell } from '@/components/dashboard/DashboardShell'

export default function BrokerLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="BROKER">{children}</DashboardShell>
}
