import { ActivityIndicator, Modal, StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { colors, radius } from "../theme";

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
          <ActivityIndicator size="large" color={colors.sea} />
          <AppText variant="small" color={colors.ink} style={styles.text}>
            {message}
          </AppText>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.scrim,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.sheet,
    padding: 24,
    alignItems: "center",
    gap: 12,
    minWidth: 180,
  },
  text: { textAlign: "center" },
});
