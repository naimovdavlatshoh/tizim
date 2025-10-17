/**
 * Utility functions for formatting numbers in the application
 */

/**
 * Formats a number with thousand separators using Uzbek locale
 * @param amount - The number to format
 * @param currency - Optional currency suffix (default: "сум")
 * @returns Formatted string with thousand separators
 */
export const formatNumber = (
    amount: number | string,
    currency?: string
): string => {
    if (amount === null || amount === undefined) return "0";

    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

    if (isNaN(numAmount)) return "0";

    const formatted = numAmount.toLocaleString("ru-RU");

    return currency ? `${formatted} ${currency}` : formatted;
};

/**
 * Formats a number as currency with Uzbek locale
 * @param amount - The number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | string): string => {
    return formatNumber(amount, "сум");
};

/**
 * Formats a number without currency suffix
 * @param amount - The number to format
 * @returns Formatted number string
 */
export const formatAmount = (amount: number | string): string => {
    return formatNumber(amount);
};

/**
 * Formats a date string to dd-mm-yyyy format
 * @param dateString - The date string to format (ISO format or any valid date string)
 * @returns Formatted date string in dd-mm-yyyy format
 */
export const formatDate = (dateString: string): string => {
    if (!dateString) return "";

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";

        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    } catch (error) {
        console.error("Error formatting date:", error);
        return "";
    }
};
