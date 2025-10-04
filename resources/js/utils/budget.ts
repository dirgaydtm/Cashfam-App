export const getSpentPercent = (
    totalExpenses: number,
    budget: number | null | undefined
): number => {
    if (!budget || budget <= 0) return 0;
    return Math.min(100, Math.round((totalExpenses / budget) * 100));
};

