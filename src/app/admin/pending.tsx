import { PendingApprovalsScreen } from "../../features/admin/screens/PendingApprovalsScreen";
import { useRequireAdmin } from "../../features/auth/hooks/useRequireAdmin";

export default function Pending() {
  const isAdmin = useRequireAdmin();
  if (!isAdmin) return null;
  return <PendingApprovalsScreen />;
}
