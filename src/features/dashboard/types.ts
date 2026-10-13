export type InsightSeverity = "WARNING" | "OPPORTUNITY" | "INFO";

export interface Dashboard {
  days: number;
  kpis: {
    revenue: number;
    cost: number;
    profit: number;
    marginPct: number;
    spentOnStock: number;
    netCashFlow: number;
    orders: number;
    unitsSold: number;
  };
  series: { label: string; revenue: number; profit: number }[];
  topProducts: {
    productId: number;
    name: string;
    units: number;
    revenue: number;
    profit: number;
  }[];
  mostViewed: {
    productId: number;
    name: string;
    views: number;
    unitsSold: number;
    conversionPct: number;
  }[];
  lowStock: { productId: number; name: string; stock: number }[];
  productsMissingCost: number;
  insights: {
    severity: InsightSeverity;
    title: string;
    message: string;
    productId: number | null;
  }[];
}

export type LedgerType = "PURCHASE" | "SALE";

export interface LedgerPayload {
  type: LedgerType;
  productId: number;
  quantity: number;
  unitAmount: number;
  entryDate: string;
  notes?: string;
  addToStock: boolean;
}
