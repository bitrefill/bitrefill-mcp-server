import { OrderListInputSchema } from '../schemas/order.js';
import { authenticatedApiClient } from '../utils/api/authenticated.js';

export class OrderService {
    public static isAvailable(): boolean {
        return authenticatedApiClient.isAvailable();
    }

    public static async getOrders(input?: unknown): Promise<unknown> {
        const options =
            input === undefined || input === null ? undefined : OrderListInputSchema.parse(input);
        return authenticatedApiClient.getOrders(options);
    }

    public static async getOrderById(id: string): Promise<unknown> {
        return authenticatedApiClient.getOrderById(id);
    }
}
