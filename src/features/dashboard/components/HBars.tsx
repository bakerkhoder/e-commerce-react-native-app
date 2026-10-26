import { StyleSheet, View } from "react-native";
import { AppText } from "@/shared/components/AppText";
import { useTranslation } from "@/i18n";
import { colors, fonts } from "@/shared/theme";

export function HBars({
  rows,
}: {
  rows: { label: string; value: number; text: string }[];
}) {
  const { t } = useTranslation();
  const max = Math.max(1, ...rows.map((r) => r.value));

  if (rows.length === 0) {
    return (
      <AppText variant="small" color={colors.muted}>
        {t("dash.noData")}
      </AppText>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      {rows.map((r, i) => (
        <View key={i}>
          <View style={s.row}>
            <AppText
              variant="small"
              style={{ flex: 1, fontFamily: fonts.bold }}
              numberOfLines={1}
            >
              {r.label}
            </AppText>
            <AppText variant="small" color={colors.muted}>
              {r.text}
            </AppText>
          </View>
          <View style={s.track}>
            <View
              style={[
                s.fill,
                {
                  width: `${Math.max((r.value / max) * 100, 2)}%`,
                  backgroundColor: colors.sea,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    gap: 8,
  },
  track: {
    height: 8,
    backgroundColor: colors.line,
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: { height: 8, borderRadius: 4 },
});
