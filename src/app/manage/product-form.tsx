import { useLocalSearchParams } from "expo-router";
import { ProductFormScreen } from "../../features/admin/screens/ProductFormScreen";

export default function ProductForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <ProductFormScreen productId={id ? Number(id) : undefined} />;
}
