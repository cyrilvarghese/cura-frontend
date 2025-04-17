/**
 * Converts single asterisk-wrapped text to bold HTML and cleans up existing HTML tags
 */
export function convertAsteriskToBold(text: string): string {
    // First clean up any existing HTML tags
    text = text.replace(/<\/?strong>/g, '*');

    // Then convert single asterisks to bold tags (non-greedy match)
    text = text.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');

    return text;
} 