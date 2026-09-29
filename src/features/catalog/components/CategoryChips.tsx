import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { Category } from "../types";

interface Props {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

export function CategoryChips({ categories, selectedId, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}
    >
      <Pressable
        style={[styles.chip, selectedId === null && styles.chipActive]}
        onPress={() => onSelect(null)}
      >
        <Text style={selectedId === null ? styles.textActive : styles.text}>
          All
        </Text>
      </Pressable>
      {categories.map((c) => (
        <Pressable
          key={c.id}
          style={[styles.chip, selectedId === c.id && styles.chipActive]}
          onPress={() => onSelect(selectedId === c.id ? null : c.id)}
        >
          <Text style={selectedId === c.id ? styles.textActive : styles.text}>
            {c.name}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Fixing the ScrollView's own height is what actually prevents the stretch bug —
  // without this, a child's cross-axis size is ambiguous and can blow up unpredictably
  scroll: { flexGrow: 0, height: 44 },
  row: { alignItems: "center", paddingHorizontal: 16, gap: 8 },
  chip: {
    flexShrink: 0, // never let a chip compress or expand to fill space
    height: 32,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  chipActive: { backgroundColor: "#111", borderColor: "#111" },
  text: { color: "#333", fontSize: 13 },
  textActive: { color: "#fff", fontSize: 13, fontWeight: "600" },
});
