/**
 * Formats a number into a compact string representation (e.g., 1000 -> 1K, 1200000 -> 1.2M).
 * @param num The number to format
 * @param decimals Number of decimal places for K/M markers
 */
export const formatNumber = (num: number = 0, decimals: number = 1): string => {
    if (num < 1000) return num.toString();
    
    const suffixes = ['', 'K', 'M', 'B', 'T'];
    const suffixNum = Math.floor(("" + num).length / 3);
    
    let shortValue: number | string = parseFloat((suffixNum !== 0 ? (num / Math.pow(1000, suffixNum)) : num).toPrecision(2));
    
    if (shortValue % 1 !== 0) {
        shortValue = shortValue.toFixed(decimals);
    }
    
    return shortValue + suffixes[suffixNum];
};

/**
 * Formats currency values into compact representations (e.g., 4200 -> $4.2K).
 * @param amount The amount to format
 */
export const formatCurrency = (amount: number = 0): string => {
    return '$' + formatNumber(amount);
};
