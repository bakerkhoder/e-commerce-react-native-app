import { useCallback, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { LoadingOverlay } from "@/shared/components/LoadingOverlay";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { formatCurrency } from "@/shared/utils/format";
import { AppText } from "@/shared/components/AppText";
import { Button } from "@/shared/components/Button";
import { colors, radius, space } from "@/shared/theme";
import { dashboardApi } from "../api/dashboardApi";
import { BarChart } from "../components/BarChart";
import { HBars } from "../components/HBars";
import { Dashboard, InsightSeverity } from "../types";

const SEVERITY_COLOR: Record<InsightSeverity, string> = {
  WARNING: colors.tomato,
  OPPORTUNITY: colors.sea,
  INFO: colors.muted,
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
              <AppText
                variant="small"
                style={days === d ? s.chipTextActive : s.chipText}
              >
                {d} days
              </AppText>
            </Pressable>
          ))}
        </View>

        <View style={s.chips}>
          <Button
            label="Record purchase"
            icon="plus"
            onPress={() =>
              router.push({
                pathname: "/manage/record",
                params: { type: "PURCHASE" },
              })
            }
          />
          <Button
            label="Record sale"
            icon="plus"
            variant="secondary"
            onPress={() =>
              router.push({
                pathname: "/manage/record",
                params: { type: "SALE" },
              })
            }
          />
        </View>

        {!data && !loading && (
          <AppText variant="small" style={s.muted}>
            Nothing to show yet. Record a purchase or a sale to get started.
          </AppText>
        )}

        {data && k && (
          <>
            <View style={s.grid}>
              {cards.map(([label, value]) => (
                <View key={label} style={s.card}>
                  <AppText variant="small" style={s.cardLabel}>
                    {label}
                  </AppText>
                  <AppText variant="heading" style={s.cardValue}>
                    {value}
                  </AppText>
                </View>
              ))}
            </View>
            <AppText
              variant="small"
              style={[
                s.cash,
                { color: k.netCashFlow >= 0 ? colors.leaf : colors.tomato },
              ]}
            >
              Net cash flow: {formatCurrency(k.netCashFlow)}
            </AppText>

            <AppText variant="heading" style={s.section}>
              Revenue &amp; profit
            </AppText>
            <BarChart data={data.series} />

            <AppText variant="heading" style={s.section}>
              Top sellers
            </AppText>
            <HBars
              rows={data.topProducts.map((p) => ({
                label: p.name,
                value: p.revenue,
                text: `${formatCurrency(p.revenue)} · ${p.units} sold`,
              }))}
            />

            <AppText variant="heading" style={s.section}>
              Most viewed
            </AppText>
            <HBars
              rows={data.mostViewed.map((v) => ({
                label: v.name,
                value: v.views,
                text: `${v.views} views · ${v.unitsSold} sold (${v.conversionPct}%)`,
              }))}
            />

            {data.lowStock.length > 0 && (
              <>
                <AppText variant="heading" style={s.section}>
                  Low stock
                </AppText>
                {data.lowStock.map((p) => (
                  <AppText key={p.productId} variant="body" style={s.line}>
                    {p.name}: {p.stock} left
                  </AppText>
                ))}
              </>
            )}

            <AppText variant="heading" style={s.section}>
              Insights
            </AppText>
            {data.insights.length === 0 && (
              <AppText variant="small" style={s.muted}>
                Nothing to flag yet. Insights appear as views and sales build up.
              </AppText>
            )}
            {data.insights.map((i, idx) => (
              <View
                key={idx}
                style={[s.insight, { borderLeftColor: SEVERITY_COLOR[i.severity] }]}
              >
                <AppText
                  variant="small"
                  style={[s.insightKind, { color: SEVERITY_COLOR[i.severity] }]}
                >
                  {SEVERITY_LABEL[i.severity]}
                </AppText>
                <AppText variant="body" style={s.insightTitle}>
                  {i.title}
                </AppText>
                <AppText variant="small" style={s.insightText}>
                  {i.message}
                </AppText>
              </View>
            ))}

            <Pressable
              style={s.aiButton}
              onPress={() => generatePlan()}
              disabled={planning}
            >
              <AppText variant="small" style={s.actionText}>
                {planning ? "Thinking…" : "Generate AI action plan"}
              </AppText>
            </Pressable>
            {plan && (
              <AppText variant="body" style={s.plan}>
                {plan}
              </AppText>
            )}

            <AppText variant="small" style={s.hint}>
              Revenue counts online orders marked Paid or later, plus sales you record
              (shipping excluded). Profit uses each product&apos;s recorded cost. Views are
              counted when a customer opens a product page.
            </AppText>
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
    borderColor: colors.line,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { color: colors.ink },
  chipTextActive: { color: colors.onSea },
  actionText: { color: colors.onSea },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  card: {
    width: "31%",
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.input,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    padding: 12,
  },
  cardLabel: { color: colors.muted },
  cardValue: { marginTop: 4 },
  cash: { marginTop: space.xs },
  section: { marginTop: space.xl, marginBottom: space.sm },
  line: { paddingVertical: 2 },
  muted: { color: colors.muted },
  insight: {
    borderLeftWidth: 4,
    backgroundColor: colors.surface,
    borderRadius: radius.input,
    padding: space.md,
    marginBottom: space.sm,
  },
  insightKind: { letterSpacing: 0.5 },
  insightTitle: { marginTop: 2 },
  insightText: { color: colors.muted, marginTop: 2 },
  aiButton: {
    backgroundColor: colors.sea,
    borderRadius: radius.button,
    padding: 12,
    alignItems: "center",
    marginTop: space.lg,
  },
  plan: {
    backgroundColor: colors.seaSoft,
    borderRadius: radius.input,
    padding: space.md,
    marginTop: space.sm,
  },
  hint: { color: colors.muted, marginTop: space.lg },
});
