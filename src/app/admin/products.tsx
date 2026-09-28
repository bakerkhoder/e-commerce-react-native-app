import { AdminProductsScreen } from "../../features/admin/screens/AdminProductsScreen";
import { useRequireAdmin } from "../../features/auth/hooks/useRequireAdmin";

export default function AdminProducts() {
  const isAdmin = useRequireAdmin();
  if (!isAdmin) return null;
  return <AdminProductsScreen />;
}
