/**
 * Format amount as Indonesian Rupiah currency
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export const formatRupiah = (amount: number): string => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
};

/**
 * Format amount with proper sign for income/expense
 * @param amount - The amount to format
 * @param type - Transaction type ('income' or 'expense')
 * @returns Formatted currency string with sign
 */
export const formatAmountWithSign = (amount: number, type: 'income' | 'expense'): string => {
    const formatted = formatRupiah(amount);
    return type === 'income' ? `+${formatted}` : `-${formatted}`;
};

/**
 * Parse Indonesian number format to number
 * @param value - String value to parse
 * @returns Parsed number
 */
export const parseRupiahInput = (value: string): number => {
    return parseFloat(value.replace(/[Rp\s.]/g, '').replace(',', '.')) || 0;
};
