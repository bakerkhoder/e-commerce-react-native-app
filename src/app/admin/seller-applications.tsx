import { SellerApplicationsScreen } from "../../features/admin/screens/SellerApplicationsScreen";
import { useRequireRole } from "../../features/auth/hooks/useRequireRole";

export default function SellerApplications() {
  const allowed = useRequireRole(["ADMIN"]);
  if (!allowed) return null;
  return <SellerApplicationsScreen />;
}
