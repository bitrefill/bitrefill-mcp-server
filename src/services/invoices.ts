import { BuyProductsInputSchema, InvoiceListInputSchema } from '../schemas/invoice.js';
import { authenticatedApiClient } from '../utils/api/authenticated.js';

export class InvoiceService {
    public static isAvailable(): boolean {
        return authenticatedApiClient.isAvailable();
    }

    public static async buyProducts(raw: unknown): Promise<unknown> {
        const body = BuyProductsInputSchema.parse(raw);
        return authenticatedApiClient.buyProducts(body);
    }

    public static async getInvoices(input?: unknown): Promise<unknown> {
        const options = input === undefined || input === null
            ? undefined
            : InvoiceListInputSchema.parse(input);
        return authenticatedApiClient.getInvoices(options);
    }

    public static async getInvoiceById(id: string): Promise<unknown> {
        return authenticatedApiClient.getInvoiceById(id);
    }

    public static async payInvoice(id: string): Promise<unknown> {
        return authenticatedApiClient.payInvoice(id);
    }
}
