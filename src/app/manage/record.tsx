import { useLocalSearchParams } from "expo-router";
import { useRequireRole } from "../../features/auth/hooks/useRequireRole";
import { RecordEntryScreen } from "../../features/dashboard/screens/RecordEntryScreen";

export default function Record() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const allowed = useRequireRole(["ADMIN", "SELLER"]);
  return allowed ? (
    <RecordEntryScreen type={type === "SALE" ? "SALE" : "PURCHASE"} />
  ) : null;
}
