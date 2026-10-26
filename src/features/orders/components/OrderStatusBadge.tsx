import { StyleSheet, View } from "react-native";
import { OrderStatus } from "../types";
import { AppText } from "@/shared/components/AppText";
import { useTranslation } from "@/i18n";
import type { TranslationKey } from "@/i18n/locales/ar";
import { colors, fonts } from "@/shared/theme";

const TONE: Record<OrderStatus, { fg: string; bg: string }> = {
  PENDING: { fg: "#8A6A00", bg: colors.lemonSoft },
  PAID: { fg: colors.sea, bg: colors.seaSoft },
  SHIPPED: { fg: "#17766F", bg: "#DAF1EF" },
  DELIVERED: { fg: colors.leaf, bg: colors.leafSoft },
  CANCELLED: { fg: colors.tomato, bg: colors.tomatoSoft },
};

export const STATUS_LABEL_KEY: Record<OrderStatus, TranslationKey> = {
  PENDING: "status.PENDING",
  PAID: "status.PAID",
  SHIPPED: "status.SHIPPED",
  DELIVERED: "status.DELIVERED",
  CANCELLED: "status.CANCELLED",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation();
  const tone = TONE[status] ?? TONE.PENDING;

  return (
    <View style={[s.badge, { backgroundColor: tone.bg }]}>
      <AppText
        variant="small"
        color={tone.fg}
        style={{ fontFamily: fonts.bold, fontSize: 11 }}
      >
        {t(STATUS_LABEL_KEY[status] ?? "status.PENDING")}
      </AppText>
    </View>
  );
}

const s = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
});
