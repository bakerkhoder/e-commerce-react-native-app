import { useLocalSearchParams } from "expo-router";
import { OrderDetailScreen } from "../../features/orders/screens/OrderDetailScreen";

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <OrderDetailScreen orderId={Number(id)} />;
}
