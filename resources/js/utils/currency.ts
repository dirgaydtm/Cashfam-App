export const formatRupiah = (amount: number): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `Rp ${numAmount.toLocaleString('id-ID')}`;
};

/**
 * Format number to thousands separator (1000000 -> 1.000.000)
 */
export const formatThousands = (value: string | number): string => {
    const stringValue = String(value);
    if (!stringValue) return '';
    return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Remove all non-digit characters from string
 */
export const parseNumericInput = (value: string): string => {
    return value.replace(/\D/g, '');
};
