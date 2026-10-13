import { StyleSheet, Text, View } from "react-native";

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
    return <Text style={s.empty}>No data yet.</Text>;
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
                  backgroundColor: "#111",
                },
              ]}
            />
            <View
              style={[
                s.bar,
                {
                  height: `${Math.max((Math.max(d.profit, 0) / max) * 100, d.profit > 0 ? 2 : 0)}%`,
                  backgroundColor: "#2f855a",
                },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={s.axis}>
        <Text style={s.small}>{data[0]?.label}</Text>
        {data.length > 2 && (
          <Text style={s.small}>{data[Math.floor(data.length / 2)]?.label}</Text>
        )}
        <Text style={s.small}>{data[data.length - 1]?.label}</Text>
      </View>
      <View style={s.legend}>
        <View style={[s.dot, { backgroundColor: "#111" }]} />
        <Text style={s.small}>Revenue</Text>
        <View style={[s.dot, { backgroundColor: "#2f855a" }]} />
        <Text style={s.small}>Profit</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  plot: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  group: {
    flex: 1,
    height: "100%",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 1,
  },
  bar: { flex: 1, borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  axis: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  legend: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  small: { fontSize: 11, color: "#777" },
  empty: { color: "#888", fontSize: 13 },
});
