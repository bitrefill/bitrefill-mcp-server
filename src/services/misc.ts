import { CheckPhoneNumberInputSchema, type CheckPhoneNumberInput } from '../schemas/misc.js';
import { authenticatedApiClient } from '../utils/api/authenticated.js';
import type { PingResponse } from '../types/api.js';

export class MiscService {
    public static isAvailable(): boolean {
        return authenticatedApiClient.isAvailable();
    }

    public static async ping(): Promise<PingResponse> {
        return authenticatedApiClient.ping();
    }

    public static async getAccountBalance(): Promise<unknown> {
        return authenticatedApiClient.getAccountBalance();
    }

    public static async checkPhoneNumber(input: CheckPhoneNumberInput): Promise<unknown> {
        const p = CheckPhoneNumberInputSchema.parse(input);
        return authenticatedApiClient.checkPhoneNumber(p.phone_number, p.operator);
    }
}
