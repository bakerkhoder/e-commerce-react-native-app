import { StyleSheet, View } from "react-native";
import { AppText } from "@/shared/components/AppText";
import { colors } from "@/shared/theme";

/**
 * Plain Views rather than a charting library: no extra dependency and no risk of an
 * SDK-version mismatch. A real chart library belongs in the design pass.
 */
export function BarChart({
  data,
  height = 140,
}: {
  data: { label: string; revenue: number; profit: number }[];
  height?: number;
}) {
  if (data.length === 0) {
    return (
      <AppText variant="small" color={colors.muted}>
        No data yet.
      </AppText>
    );
  }

  const max = Math.max(1, ...data.map((d) => d.revenue));

  return (
    <View>
      <View style={[s.plot, { height }]}>
        {data.map((d, i) => (
          <View key={i} style={s.group}>
            <View
              style={[
                s.bar,
                {
                  height: `${Math.max((d.revenue / max) * 100, d.revenue > 0 ? 2 : 0)}%`,
                  backgroundColor: colors.sea,
                },
              ]}
            />
            <View
              style={[
                s.bar,
                {
                  height: `${Math.max((Math.max(d.profit, 0) / max) * 100, d.profit > 0 ? 2 : 0)}%`,
                  backgroundColor: colors.leaf,
                },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={s.axis}>
        <AppText variant="small" color={colors.muted}>
          {data[0]?.label}
        </AppText>
        {data.length > 2 && (
          <AppText variant="small" color={colors.muted}>
            {data[Math.floor(data.length / 2)]?.label}
          </AppText>
        )}
        <AppText variant="small" color={colors.muted}>
          {data[data.length - 1]?.label}
        </AppText>
      </View>
      <View style={s.legend}>
        <View style={[s.dot, { backgroundColor: colors.sea }]} />
        <AppText variant="small" color={colors.muted}>
          Revenue
        </AppText>
        <View style={[s.dot, { backgroundColor: colors.leaf }]} />
        <AppText variant="small" color={colors.muted}>
          Profit
        </AppText>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  plot: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  group: {
    flex: 1,
    height: "100%",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 1,
  },
  bar: { flex: 1, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  axis: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  legend: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
