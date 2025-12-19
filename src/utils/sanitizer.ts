export const sanitizeInput = (input: string, maxLength = 15): string => {
    // Remove all characters except letters, numbers, spaces, and basic punctuation
    const sanitized = input.replace(/[^a-zA-Z0-9!?\-:. ]/g, '');

    // Limit the length to a maximum of maxLength characters
    return sanitized.substring(0, maxLength);
};
