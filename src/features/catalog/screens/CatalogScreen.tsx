import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { catalogApi } from "../api/catalogApi";
import { ProductCard } from "../components/ProductCard";
import { Product } from "../types";

const DEBOUNCE_MS = 400;

export function CatalogScreen() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    catalogApi.getProducts().then((data) => {
      setAllProducts(data);
      setProducts(data);
      setLoading(false);
    });
  }, []);

  function handleQueryChange(text: string) {
    setQuery(text);

    // Cancel any pending search — this is the actual debounce mechanism:
    // every keystroke clears the previous timer and starts a fresh one
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => runSearch(text), DEBOUNCE_MS);
  }

  async function runSearch(text: string) {
    if (text.trim().length === 0) {
      setProducts(allProducts);
      setSearching(false);
      return;
    }
    setSearching(true);
    try {
      const results = await catalogApi.search(text);
      const mapped = results.map((doc: any) => ({
        id: doc.metadata.productId,
        name: doc.metadata.name,
        price: Number(doc.metadata.price),
        categoryName: "",
        description: doc.text,
      })) as Product[];
      setProducts(mapped);
    } finally {
      setSearching(false);
    }
  }

  // Clean up any pending timer if the screen unmounts mid-typing —
  // prevents a "setState on unmounted component" warning
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  if (loading) {
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
        placeholder="Search... try 'organic' or 'milk'"
        value={query}
        onChangeText={handleQueryChange}
      />
      {searching && <ActivityIndicator style={{ marginTop: 8 }} />}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => <ProductCard product={item} />}
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
});
