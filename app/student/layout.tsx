import { PortalShell } from "../components/layout/PortalShell";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell allowedRoles={["student"]}>{children}</PortalShell>;
}
