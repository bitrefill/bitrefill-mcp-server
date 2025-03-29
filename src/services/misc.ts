import {
  PingResponse,
  AccountBalanceResponse,
  CheckPhoneNumberOptions,
} from "../schemas/misc.js";
import { authenticatedApiClient } from "../utils/api/authenticated.js";

/**
 * Service for miscellaneous operations
 * Uses the AuthenticatedApiClient for API requests
 */
export class MiscService {
  /**
   * Check if the auth-dependent services are available (API key is set)
   * @returns True if the service is available, false otherwise
   */
  public static isAvailable(): boolean {
    return authenticatedApiClient.isAvailable();
  }

  /**
   * Ping the API to check if it's available
   * @returns Ping response
   */
  public static async ping(): Promise<PingResponse> {
    return authenticatedApiClient.ping();
  }

  /**
   * Get account balance
   * @returns Account balance
   * @throws Error if the API request fails or if the API key is not set
   */
  public static async getAccountBalance(): Promise<AccountBalanceResponse> {
    return authenticatedApiClient.getAccountBalance();
  }
}
