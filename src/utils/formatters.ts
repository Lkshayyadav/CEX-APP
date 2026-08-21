/**
 * Formats numbers into currency format (e.g. $98,450.25)
 */
export const formatCurrency = (val: string | number | undefined | null, decimals = 2): string => {
  if (val === undefined || val === null || val === "") return "---";
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "---";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

/**
 * Formats crypto asset quantity (e.g. 0.00450000 BTC)
 */
export const formatAmount = (val: string | number | undefined | null, decimals = 4): string => {
  if (val === undefined || val === null || val === "") return "0.00";
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "0.00";
  return num.toFixed(decimals);
};

/**
 * Formats percentage change string with + / - sign
 */
export const formatPercentage = (changeStr: string | undefined | null): { text: string; isPositive: boolean } => {
  if (!changeStr) return { text: "0.00%", isPositive: true };
  const cleaned = changeStr.trim();
  const num = parseFloat(cleaned.replace("%", "").replace("+", ""));
  const isPositive = num >= 0;
  const sign = isPositive && !cleaned.startsWith("+") ? "+" : "";
  return {
    text: `${sign}${cleaned}`,
    isPositive,
  };
};

/**
 * Formats timestamp to readable time string (HH:mm:ss)
 */
export const formatTime = (timestamp: number | string | Date): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", { hour12: false });
};
