import { AdminOrdersScreen } from "../../features/admin/screens/AdminOrdersScreen";
import { useRequireRole } from "../../features/auth/hooks/useRequireRole";

export default function AdminOrders() {
  const allowed = useRequireRole(["ADMIN"]);
  if (!allowed) return null;
  return <AdminOrdersScreen />;
}
