export function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function formatDate(iso: string): string {
  return new Date(iso.replace(/(\.\d{3})\d+/, "$1")).toLocaleString();
}
