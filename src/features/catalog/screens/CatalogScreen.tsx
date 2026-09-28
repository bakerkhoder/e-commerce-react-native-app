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
import { ProductCard } from "../components/ProductCard";
import { Product } from "../types";

const DEBOUNCE_MS = 400;

export function CatalogScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const queryRef = useRef(""); // latest query, readable inside focus callbacks
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef(0);

  // Empty query -> full catalog, otherwise -> search. The request counter makes sure a slow
  // older response can never overwrite a newer one (classic typeahead race condition).
  const load = useCallback(async (text: string) => {
    const id = ++requestId.current;
    const term = text.trim();
    const data = term
      ? await catalogApi.search(term)
      : await catalogApi.getProducts();
    if (id === requestId.current) setProducts(data);
  }, []);

  // Runs every time the Shop tab gains focus (e.g. after an admin adds a product)
  useFocusEffect(
    useCallback(() => {
      load(queryRef.current)
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
      load(text)
        .catch(() => {})
        .finally(() => setSearching(false));
    }, DEBOUNCE_MS);
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await load(queryRef.current);
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
            {query.trim()
              ? "No products match your search."
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
    marginBottom: 0,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  empty: { textAlign: "center", color: "#888", marginTop: 40 },
});
