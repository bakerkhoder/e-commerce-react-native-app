import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { formatDate } from "../../../shared/utils/format";
import {
  SellerApplication,
  sellerApplicationApi,
} from "../../profile/api/sellerApplicationApi";

export function SellerApplicationsScreen() {
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    sellerApplicationApi
      .getPending()
      .then(setApplications)
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(load);

  const { run: handleDecision, pending } = useAsyncAction(
    async (id: number, approve: boolean) => {
      await (approve
        ? sellerApplicationApi.approve(id)
        : sellerApplicationApi.reject(id));
      setApplications((prev) => prev.filter((a) => a.id !== id));
    },
    {
      errorTitle: "Could not process",
      fallbackMessage: "Please try again.",
    },
  );

  return (
    <FlatList
      data={applications}
      keyExtractor={(a) => a.id.toString()}
      contentContainerStyle={{ padding: 16 }}
      refreshing={loading}
      onRefresh={load}
      ListEmptyComponent={
        <Text style={styles.empty}>No pending seller applications.</Text>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.name}>{item.businessName}</Text>
          <Text style={styles.meta}>
            User #{item.userId} · applied {formatDate(item.submittedAt)}
          </Text>
          <View style={styles.row}>
            <Pressable
              style={[
                styles.button,
                styles.approve,
                pending && { opacity: 0.6 },
              ]}
              onPress={() => handleDecision(item.id, true)}
              disabled={pending}
            >
              <Text style={styles.buttonText}>Approve</Text>
            </Pressable>
            <Pressable
              style={[
                styles.button,
                styles.reject,
                pending && { opacity: 0.6 },
              ]}
              onPress={() => handleDecision(item.id, false)}
              disabled={pending}
            >
              <Text style={styles.buttonText}>Reject</Text>
            </Pressable>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: "center", color: "#888", marginTop: 40 },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    gap: 8,
  },
  name: { fontSize: 16, fontWeight: "600" },
  meta: { fontSize: 13, color: "#777" },
  row: { flexDirection: "row", gap: 10, marginTop: 4 },
  button: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  approve: { backgroundColor: "#2f855a" },
  reject: { backgroundColor: "#c0392b" },
  buttonText: { color: "#fff", fontWeight: "600" },
});
