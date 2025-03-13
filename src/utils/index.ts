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