import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Category } from "../types";
import { AppText } from "@/shared/components/AppText";
import { aisle, colors, fonts, radius } from "@/shared/theme";
import { useTranslation } from "@/i18n";

function Chip({
  label,
  active,
  tone,
  dot,
  onPress,
}: {
  label: string;
  active: boolean;
  tone: string;
  dot?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[s.chip, active && { backgroundColor: tone, borderColor: tone }]}
    >
      {dot && (
        <View style={[s.dot, { backgroundColor: active ? "#fff" : tone }]} />
      )}
      <AppText
        variant="small"
        color={active ? "#fff" : colors.ink}
        style={{ fontFamily: fonts.semibold }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

export function CategoryChips({
  categories,
  selectedId,
  onSelect,
}: {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}) {
  const { t } = useTranslation();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={s.scroll}
      contentContainerStyle={s.row}
    >
      <Chip
        label={t("catalog.all")}
        active={selectedId === null}
        tone={colors.ink}
        onPress={() => onSelect(null)}
      />
      {categories.map((c) => (
        <Chip
          key={c.id}
          label={c.name}
          dot
          active={selectedId === c.id}
          tone={aisle(c.id).tone}
          onPress={() => onSelect(selectedId === c.id ? null : c.id)}
        />
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  // Fixing the ScrollView's own height is what actually prevents the stretch bug —
  // without this, a child's cross-axis size is ambiguous and can blow up unpredictably
  scroll: { flexGrow: 0, height: 40 },
  row: { gap: 8, alignItems: "center", paddingEnd: 8 },
  chip: {
    flexShrink: 0, // never let a chip compress or expand to fill space
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
