export const formatRupiah = (amount: number): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `Rp ${numAmount.toLocaleString('id-ID')}`;
};
