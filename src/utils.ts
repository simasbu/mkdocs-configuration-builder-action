import * as glob from 'glob';

/**
 * Replaces underscores with spaces in the provided string and returns the outcome value back.
 * @param {string} text The string that needs to have underscores replaced with spaces.
 */
export function replaceUnderscoresWithSpaces(text: string): string {
  return text.replace(/_/g, ' ').trim();
}
