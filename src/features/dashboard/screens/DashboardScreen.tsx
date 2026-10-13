import { useCallback, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { LoadingOverlay } from "../../../shared/components/LoadingOverlay";
import { useAsyncAction } from "../../../shared/hooks/useAsyncAction";
import { formatCurrency } from "../../../shared/utils/format";
import { dashboardApi } from "../api/dashboardApi";
import { BarChart } from "../components/BarChart";
import { HBars } from "../components/HBars";
import { Dashboard, InsightSeverity } from "../types";

const SEVERITY_COLOR: Record<InsightSeverity, string> = {
  WARNING: "#c0392b",
  OPPORTUNITY: "#2563eb",
  INFO: "#777",
};

const SEVERITY_LABEL: Record<InsightSeverity, string> = {
  WARNING: "Needs attention",
  OPPORTUNITY: "Opportunity",
  INFO: "Note",
};

export function DashboardScreen() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Dashboard | null>(null);
  const [plan, setPlan] = useState<string | null>(null);

  const { run: refresh, pending: loading } = useAsyncAction(
    async (d: number) => {
      setData(await dashboardApi.get(d));
    },
    { errorTitle: "Could not load the dashboard" },
  );

  const { run: generatePlan, pending: planning } = useAsyncAction(
    async () => {
      setPlan((await dashboardApi.aiPlan(days)).plan);
    },
    { errorTitle: "AI advisor" },
  );

  useFocusEffect(
    useCallback(() => {
      refresh(days);
      // refresh is stable per render of the hook; days is the real input here
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [days]),
  );

  const k = data?.kpis;
  const cards: [string, string][] = k
    ? [
        ["Revenue", formatCurrency(k.revenue)],
        ["Profit", formatCurrency(k.profit)],
        ["Margin", `${k.marginPct}%`],
        ["Orders", String(k.orders)],
        ["Units sold", String(k.unitsSold)],
        ["Spent on stock", formatCurrency(k.spentOnStock)],
      ]
    : [];

  return (
    <>
      <ScrollView
        contentContainerStyle={s.container}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => refresh(days)} />
        }
      >
        <View style={s.chips}>
          {[7, 30, 90].map((d) => (
            <Pressable
              key={d}
              style={[s.chip, days === d && s.chipActive]}
              onPress={() => {
                setPlan(null);
                setDays(d);
              }}
            >
              <Text style={days === d ? s.chipTextActive : s.chipText}>
                {d} days
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={s.chips}>
          <Pressable
            style={s.action}
            onPress={() =>
              router.push({
                pathname: "/manage/record",
                params: { type: "PURCHASE" },
              })
            }
          >
            <Text style={s.actionText}>+ Record purchase</Text>
          </Pressable>
          <Pressable
            style={s.action}
            onPress={() =>
              router.push({
                pathname: "/manage/record",
                params: { type: "SALE" },
              })
            }
          >
            <Text style={s.actionText}>+ Record sale</Text>
          </Pressable>
        </View>

        {!data && !loading && (
          <Text style={s.muted}>
            Nothing to show yet. Record a purchase or a sale to get started.
          </Text>
        )}

        {data && k && (
          <>
            <View style={s.grid}>
              {cards.map(([label, value]) => (
                <View key={label} style={s.card}>
                  <Text style={s.cardLabel}>{label}</Text>
                  <Text style={s.cardValue}>{value}</Text>
                </View>
              ))}
            </View>
            <Text
              style={[
                s.cash,
                { color: k.netCashFlow >= 0 ? "#2f855a" : "#c0392b" },
              ]}
            >
              Net cash flow: {formatCurrency(k.netCashFlow)}
            </Text>

            <Text style={s.section}>Revenue &amp; profit</Text>
            <BarChart data={data.series} />

            <Text style={s.section}>Top sellers</Text>
            <HBars
              rows={data.topProducts.map((p) => ({
                label: p.name,
                value: p.revenue,
                text: `${formatCurrency(p.revenue)} · ${p.units} sold`,
              }))}
            />

            <Text style={s.section}>Most viewed</Text>
            <HBars
              rows={data.mostViewed.map((v) => ({
                label: v.name,
                value: v.views,
                text: `${v.views} views · ${v.unitsSold} sold (${v.conversionPct}%)`,
              }))}
            />

            {data.lowStock.length > 0 && (
              <>
                <Text style={s.section}>Low stock</Text>
                {data.lowStock.map((p) => (
                  <Text key={p.productId} style={s.line}>
                    {p.name}: {p.stock} left
                  </Text>
                ))}
              </>
            )}

            <Text style={s.section}>Insights</Text>
            {data.insights.length === 0 && (
              <Text style={s.muted}>
                Nothing to flag yet. Insights appear as views and sales build up.
              </Text>
            )}
            {data.insights.map((i, idx) => (
              <View
                key={idx}
                style={[s.insight, { borderLeftColor: SEVERITY_COLOR[i.severity] }]}
              >
                <Text style={[s.insightKind, { color: SEVERITY_COLOR[i.severity] }]}>
                  {SEVERITY_LABEL[i.severity]}
                </Text>
                <Text style={s.insightTitle}>{i.title}</Text>
                <Text style={s.insightText}>{i.message}</Text>
              </View>
            ))}

            <Pressable
              style={s.aiButton}
              onPress={() => generatePlan()}
              disabled={planning}
            >
              <Text style={s.actionText}>
                {planning ? "Thinking…" : "Generate AI action plan"}
              </Text>
            </Pressable>
            {plan && <Text style={s.plan}>{plan}</Text>}

            <Text style={s.hint}>
              Revenue counts online orders marked Paid or later, plus sales you record
              (shipping excluded). Profit uses each product's recorded cost. Views are
              counted when a customer opens a product page.
            </Text>
          </>
        )}
      </ScrollView>
      <LoadingOverlay visible={planning} message="Analyzing your numbers..." />
    </>
  );
}

const s = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48, gap: 6 },
  chips: { flexDirection: "row", gap: 8, marginBottom: 8 },
  chip: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipActive: { backgroundColor: "#111", borderColor: "#111" },
  chipText: { color: "#333", fontSize: 13 },
  chipTextActive: { color: "#fff", fontSize: 13, fontWeight: "600" },
  action: {
    backgroundColor: "#111",
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  actionText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: {
    width: "31%",
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
  },
  cardLabel: { fontSize: 11, color: "#777" },
  cardValue: { fontSize: 16, fontWeight: "700", marginTop: 4 },
  cash: { fontSize: 14, fontWeight: "600", marginTop: 4 },
  section: { fontSize: 16, fontWeight: "700", marginTop: 20, marginBottom: 8 },
  line: { fontSize: 14, paddingVertical: 2 },
  muted: { color: "#888", fontSize: 13 },
  insight: {
    borderLeftWidth: 4,
    backgroundColor: "#f8f8f8",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  insightKind: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  insightTitle: { fontSize: 14, fontWeight: "700", marginTop: 2 },
  insightText: { fontSize: 13, color: "#555", marginTop: 2 },
  aiButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 16,
  },
  plan: {
    backgroundColor: "#eef4ff",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
  },
  hint: { fontSize: 11, color: "#999", marginTop: 16 },
});
