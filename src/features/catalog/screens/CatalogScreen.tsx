import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { catalogApi } from "../api/catalogApi";
import { CategoryChips } from "../components/CategoryChips";
import { ProductCard } from "../components/ProductCard";
import { AppText } from "@/shared/components/AppText";
import { EmptyState } from "@/shared/components/EmptyState";
import { Input } from "@/shared/components/Input";
import { apiErrorMessage } from "@/shared/utils/apiError";
import { useTranslation } from "@/i18n";
import { MAX_QUERY } from "@/shared/constants/limits";
import { colors, space } from "@/shared/theme";
import { Category, Product } from "../types";

const DEBOUNCE_MS = 400;

export function CatalogScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryRef = useRef("");
  const categoryRef = useRef<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    catalogApi
      .getCategories()
      .then(setCategories)
      .catch(() => {
        // category chips are optional chrome; the product list reports its own errors
      });
  }, []);

  const load = useCallback(async (text: string, catId: number | null) => {
    const id = ++requestId.current;
    const term = text.trim();
    try {
      const data = term
        ? await catalogApi.search(term, catId ?? undefined)
        : await catalogApi.getProducts(catId ?? undefined);
      if (id === requestId.current) {
        setProducts(data);
        setError(null);
      }
    } catch (err) {
      if (id === requestId.current) {
        setError(apiErrorMessage(err, t, "catalog.loadError"));
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(queryRef.current, categoryRef.current).finally(() =>
        setInitialLoading(false),
      );
    }, [load]),
  );

  function handleQueryChange(text: string) {
    setQuery(text);
    queryRef.current = text;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearching(true);
      load(text, categoryRef.current).finally(() => setSearching(false));
    }, DEBOUNCE_MS);
  }

  function handleCategorySelect(id: number | null) {
    setCategoryId(id);
    categoryRef.current = id;
    setSearching(true);
    load(queryRef.current, id).finally(() => setSearching(false));
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await load(queryRef.current, categoryRef.current);
    } finally {
      setRefreshing(false);
    }
  }

  function clearFilters() {
    setQuery("");
    queryRef.current = "";
    setCategoryId(null);
    categoryRef.current = null;
    load("", null).catch(() => {});
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  if (initialLoading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={colors.sea} />
      </View>
    );
  }

  const filtered = !!query.trim() || categoryId !== null;

  return (
    <FlatList
      data={products}
      numColumns={2}
      keyExtractor={(item) => item.id.toString()}
      columnWrapperStyle={{ justifyContent: "space-between" }}
      contentContainerStyle={{
        padding: space.lg,
        paddingTop: space.sm,
        gap: space.md,
        flexGrow: 1,
      }}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.sea}
          colors={[colors.sea]}
        />
      }
      ListHeaderComponent={
        <View style={{ marginBottom: space.xs }}>
          <Input
            icon="search"
            placeholder={t("catalog.searchPlaceholder")}
            value={query}
            onChangeText={handleQueryChange}
            autoCapitalize="none"
            returnKeyType="search"
            maxLength={MAX_QUERY}
          />
          <CategoryChips
            categories={categories}
            selectedId={categoryId}
            onSelect={handleCategorySelect}
          />
          {searching && (
            <ActivityIndicator color={colors.sea} style={{ marginTop: space.md }} />
          )}
          {error && (
            <AppText
              variant="small"
              color={colors.tomato}
              onPress={handleRefresh}
              style={{ textAlign: "center", marginTop: space.md }}
            >
              {error} {t("catalog.tapToRetry")}
            </AppText>
          )}
        </View>
      }
      renderItem={({ item }) => <ProductCard product={item} />}
      ListEmptyComponent={
        <EmptyState
          icon="search"
          title={filtered ? t("catalog.nothingMatches") : t("catalog.noProducts")}
          message={
            filtered
              ? t("catalog.tryShorter")
              : t("catalog.newProductsHere")
          }
          action={
            filtered
              ? { label: t("catalog.clearFilters"), onPress: clearFilters }
              : undefined
          }
        />
      }
    />
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
