import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";

export function LoadingOverlay({
  visible,
  message,
}: {
  visible: boolean;
  message: string;
}) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#111" />
          <Text style={styles.text}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    gap: 12,
    minWidth: 180,
  },
  text: { fontSize: 14, color: "#333", textAlign: "center" },
});
