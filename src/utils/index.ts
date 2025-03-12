/**
 * Utility functions for Bitrefill MCP server
 */

/**
 * Log an error with a standardized format
 * @param error - Error object or message
 * @param context - Optional context information
 */
export function logError(error: Error | string, context?: string): void {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : error;
  const stackTrace = error instanceof Error ? error.stack : undefined;
  
  console.error(`[${timestamp}] ERROR${context ? ` [${context}]` : ''}: ${errorMessage}`);
  
  if (stackTrace) {
    console.error(stackTrace);
  }
}

/**
 * Safe JSON parsing with error handling
 * @param json - JSON string to parse
 * @param defaultValue - Default value to return if parsing fails
 * @returns Parsed object or default value
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    logError(error as Error, 'JSON Parse');
    return defaultValue;
  }
}

/**
 * Safely access a potentially undefined property with a default value
 * @param obj - Object to access property from
 * @param key - Property key
 * @param defaultValue - Default value if property is undefined
 * @returns Property value or default value
 */
export function getValueWithDefault<T, K extends keyof T>(
  obj: T | undefined | null,
  key: K,
  defaultValue: T[K]
): T[K] {
  if (!obj) {
    return defaultValue;
  }
  
  return obj[key] !== undefined ? obj[key] : defaultValue;
}
