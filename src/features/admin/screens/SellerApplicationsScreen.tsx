import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { AppText } from "@/shared/components/AppText";
import { Button } from "@/shared/components/Button";
import { EmptyState } from "@/shared/components/EmptyState";
import { formatDate } from "@/shared/utils/format";
import { colors, radius, space } from "@/shared/theme";
import {
  SellerApplication,
  sellerApplicationApi,
} from "../../profile/api/sellerApplicationApi";
import { useTranslation } from "@/i18n";

export function SellerApplicationsScreen() {
  const { t } = useTranslation();
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    return sellerApplicationApi
      .getPending()
      .then(setApplications)
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const { run: handleDecision, pending } = useAsyncAction(
    async (id: number, approve: boolean) => {
      await (approve
        ? sellerApplicationApi.approve(id)
        : sellerApplicationApi.reject(id));
      setApplications((prev) => prev.filter((a) => a.id !== id));
    },
    { errorTitleKey: "admin.processFailed" },
  );

  if (applications.length === 0) {
    return (
      <EmptyState
        icon="users"
        title={t("admin.applicationsTitle")}
        message={
          loading
            ? t("admin.loadingApplications")
            : t("admin.applicationsEmpty")
        }
      />
    );
  }

  return (
    <FlatList
      data={applications}
      keyExtractor={(a) => a.id.toString()}
      contentContainerStyle={{ padding: space.lg, gap: space.md }}
      refreshing={loading}
      onRefresh={load}
      renderItem={({ item }) => (
        <View style={s.card}>
          <AppText variant="heading">{item.businessName}</AppText>
          <AppText variant="small" color={colors.muted}>
            User #{item.userId}, applied {formatDate(item.submittedAt)}
          </AppText>
          <View style={s.row}>
            <Button
              label={t("admin.approve")}
              icon="check"
              loading={pending}
              onPress={() => handleDecision(item.id, true)}
              style={{ flex: 1 }}
            />
            <Button
              label={t("admin.reject")}
              variant="danger"
              disabled={pending}
              onPress={() => handleDecision(item.id, false)}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      )}
    />
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.image,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    padding: space.lg,
    gap: space.sm,
  },
  row: { flexDirection: "row", gap: space.md, marginTop: space.xs },
});
