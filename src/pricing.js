export const PRICES = {
  single: 5,  // копійок за одношаровий стакан
  double: 10, // копійок за двошаровий стакан
};

export function calcEarned(item) {
  const price = PRICES[item.cupType] || 0;
  return price * item.cupsCount;
}

export function cupLabel(item) {
  return item.cupType === "double" ? "Двошаровий" : "Одношаровий";
}

export function formatMoney(kopecks) {
  return `${(kopecks / 100).toLocaleString("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} грн`;
}