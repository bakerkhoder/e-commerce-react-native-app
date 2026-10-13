import { useRequireRole } from "../../features/auth/hooks/useRequireRole";
import { DashboardScreen } from "../../features/dashboard/screens/DashboardScreen";

export default function Dashboard() {
  const allowed = useRequireRole(["ADMIN", "SELLER"]);
  return allowed ? <DashboardScreen /> : null;
}
