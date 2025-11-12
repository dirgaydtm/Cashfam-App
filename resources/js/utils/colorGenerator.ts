/**
 * Generate consistent color class based on ID
 * Uses modulo to cycle through predefined color palette
 */

const colorPalette = [
    'bg-primary/80',
    'bg-secondary/80',
    'bg-accent/80',
    'bg-success/80',
    'bg-warning/80',
    'bg-error/80'
];

export const getColorById = (id: number | string): string => {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    return colorPalette[numericId % colorPalette.length];
};

export const getColorPalette = () => colorPalette;
