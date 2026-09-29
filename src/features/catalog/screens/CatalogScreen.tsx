import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { catalogApi } from "../api/catalogApi";
import { CategoryChips } from "../components/CategoryChips";
import { ProductCard } from "../components/ProductCard";
import { Category, Product } from "../types";

const DEBOUNCE_MS = 400;

export function CatalogScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const queryRef = useRef("");
  const categoryRef = useRef<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    catalogApi
      .getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  const load = useCallback(async (text: string, catId: number | null) => {
    const id = ++requestId.current;
    const term = text.trim();
    const data = term
      ? await catalogApi.search(term, catId ?? undefined)
      : await catalogApi.getProducts(catId ?? undefined);
    if (id === requestId.current) setProducts(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(queryRef.current, categoryRef.current)
        .catch(() => {})
        .finally(() => setInitialLoading(false));
    }, [load]),
  );

  function handleQueryChange(text: string) {
    setQuery(text);
    queryRef.current = text;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearching(true);
      load(text, categoryRef.current)
        .catch(() => {})
        .finally(() => setSearching(false));
    }, DEBOUNCE_MS);
  }

  function handleCategorySelect(id: number | null) {
    setCategoryId(id);
    categoryRef.current = id;
    setSearching(true);
    load(queryRef.current, id)
      .catch(() => {})
      .finally(() => setSearching(false));
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await load(queryRef.current, categoryRef.current);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  if (initialLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search products..."
        value={query}
        onChangeText={handleQueryChange}
        autoCapitalize="none"
      />
      <CategoryChips
        categories={categories}
        selectedId={categoryId}
        onSelect={handleCategorySelect}
      />
      {searching && <ActivityIndicator style={{ marginTop: 8 }} />}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => <ProductCard product={item} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            {query.trim() || categoryId
              ? "No products match."
              : "No products yet."}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  searchBar: {
    margin: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  empty: { textAlign: "center", color: "#888", marginTop: 40 },
});
