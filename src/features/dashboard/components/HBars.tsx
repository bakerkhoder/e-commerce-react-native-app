import { StyleSheet, Text, View } from "react-native";

export function HBars({
  rows,
}: {
  rows: { label: string; value: number; text: string }[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));

  if (rows.length === 0) {
    return <Text style={s.empty}>No data yet.</Text>;
  }

  return (
    <View style={{ gap: 10 }}>
      {rows.map((r, i) => (
        <View key={i}>
          <View style={s.row}>
            <Text style={s.label} numberOfLines={1}>
              {r.label}
            </Text>
            <Text style={s.value}>{r.text}</Text>
          </View>
          <View style={s.track}>
            <View
              style={[
                s.fill,
                { width: `${Math.max((r.value / max) * 100, 2)}%` },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  empty: { color: "#888", fontSize: 13 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    gap: 8,
  },
  label: { flex: 1, fontSize: 13, fontWeight: "600" },
  value: { fontSize: 12, color: "#666" },
  track: { height: 8, backgroundColor: "#eee", borderRadius: 4 },
  fill: { height: 8, backgroundColor: "#111", borderRadius: 4 },
});
