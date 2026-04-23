import { CreateEsimInvoiceInputSchema, EsimListInputSchema } from '../schemas/esim.js';
import type { SearchProductsInput } from '../schemas/search.js';
import { authenticatedApiClient } from '../utils/api/authenticated.js';
import type { Envelope, ListEnvelope, Product, EsimListItem } from '../types/api.js';

export class EsimService {
    public static isAvailable(): boolean {
        return authenticatedApiClient.isAvailable();
    }

    public static async listEsimProducts(
        input: Partial<SearchProductsInput> = {}
    ): Promise<ListEnvelope<Product[]>> {
        return authenticatedApiClient.getEsimProducts(input);
    }

    public static async getEsimProduct(id: string): Promise<Envelope<Product>> {
        return authenticatedApiClient.getEsimProductById(id);
    }

    public static async createEsimInvoice(raw: unknown): Promise<unknown> {
        const body = CreateEsimInvoiceInputSchema.parse(raw);
        return authenticatedApiClient.createEsimInvoice(body);
    }

    public static async getEsimInvoice(id: string): Promise<unknown> {
        return authenticatedApiClient.getEsimInvoice(id);
    }

    public static async payEsimInvoice(id: string): Promise<unknown> {
        return authenticatedApiClient.payEsimInvoice(id);
    }

    public static async listEsims(input?: unknown): Promise<ListEnvelope<EsimListItem[]>> {
        const options =
            input === undefined || input === null ? undefined : EsimListInputSchema.parse(input);
        return authenticatedApiClient.listEsims(options);
    }

    public static async getEsim(iccid: string): Promise<Envelope<EsimListItem>> {
        return authenticatedApiClient.getEsim(iccid);
    }
}
