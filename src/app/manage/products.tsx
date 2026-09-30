import { AdminProductsScreen } from "../../features/admin/screens/AdminProductsScreen";
import { useRequireRole } from "../../features/auth/hooks/useRequireRole";

export default function ManageProducts() {
  const allowed = useRequireRole(["ADMIN", "SELLER"]);
  if (!allowed) return null;
  return <AdminProductsScreen />;
}
