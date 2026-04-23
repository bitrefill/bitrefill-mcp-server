/**
 * Bitrefill API v2 — Bearer ${BITREFILL_API_KEY} only
 */
import type { BuyProductsInput, InvoiceListInput } from '../../schemas/invoice.js';
import type { CreateEsimInvoiceInput, EsimListInput } from '../../schemas/esim.js';
import type { OrderListInput } from '../../schemas/order.js';
import type { SearchProductsInput } from '../../schemas/search.js';
import type {
    Envelope,
    ListEnvelope,
    PingResponse,
    Product,
    EsimListItem,
} from '../../types/api.js';
import { BaseApiClient, DEFAULT_HEADERS } from './base.js';

export class AuthenticatedApiClient extends BaseApiClient {
    protected readonly baseUrl = 'https://api.bitrefill.com/v2';

    protected readonly context = 'AuthenticatedApiClient';

    public isAvailable(): boolean {
        return !!process.env.BITREFILL_API_KEY?.trim();
    }

    private getAuthHeader(): string {
        const key = process.env.BITREFILL_API_KEY?.trim();
        if (!key) {
            throw new Error('BITREFILL_API_KEY is not set');
        }
        return `Bearer ${key}`;
    }

    private authJsonHeaders(): HeadersInit {
        return {
            ...DEFAULT_HEADERS,
            'Content-Type': 'application/json',
            authorization: this.getAuthHeader(),
        };
    }

    private authGetHeaders(): HeadersInit {
        return {
            ...DEFAULT_HEADERS,
            authorization: this.getAuthHeader(),
        };
    }

    // --- products ---

    public async getProducts(
        input: SearchProductsInput
    ): Promise<ListEnvelope<Product[]>> {
        return this.makeRequest<ListEnvelope<Product[]>>(
            `products${this.buildQueryString({
                start: input.start,
                limit: input.limit,
                country: input.country,
                category: input.category,
                include_test_products: input.include_test_products,
            })}`,
            { method: 'GET', headers: this.authGetHeaders() }
        );
    }

    public async searchProducts(
        input: SearchProductsInput & { q: string }
    ): Promise<ListEnvelope<Product[]>> {
        return this.makeRequest<ListEnvelope<Product[]>>(
            `products/search${this.buildQueryString({
                q: input.q,
                start: input.start,
                limit: input.limit,
                include_test_products: input.include_test_products,
            })}`,
            { method: 'GET', headers: this.authGetHeaders() }
        );
    }

    public async getProductById(id: string): Promise<Envelope<Product>> {
        return this.makeRequest<Envelope<Product>>(`products/${encodeURIComponent(id)}`, {
            method: 'GET',
            headers: this.authGetHeaders(),
        });
    }

    public async getEsimProducts(
        input: Pick<SearchProductsInput, 'start' | 'limit' | 'include_test_products' | 'country' | 'category'>
    ): Promise<ListEnvelope<Product[]>> {
        return this.makeRequest<ListEnvelope<Product[]>>(
            `products/esims${this.buildQueryString({
                start: input.start,
                limit: input.limit,
                include_test_products: input.include_test_products,
                country: input.country,
                category: input.category,
            })}`,
            { method: 'GET', headers: this.authGetHeaders() }
        );
    }

    public async getEsimProductById(id: string): Promise<Envelope<Product>> {
        return this.makeRequest<Envelope<Product>>(
            `products/esims/${encodeURIComponent(id)}`,
            { method: 'GET', headers: this.authGetHeaders() }
        );
    }

    // --- invoices / orders ---

    public async buyProducts(body: BuyProductsInput): Promise<unknown> {
        return this.makeRequest<unknown>('invoices', {
            method: 'POST',
            headers: this.authJsonHeaders(),
            body: JSON.stringify(body),
        });
    }

    public async getInvoices(
        input?: InvoiceListInput
    ): Promise<unknown> {
        return this.makeRequest<unknown>(`invoices${this.buildQueryString(input as Record<string, unknown>)}`, {
            method: 'GET',
            headers: this.authGetHeaders(),
        });
    }

    public async getInvoiceById(id: string): Promise<unknown> {
        return this.makeRequest<unknown>(`invoices/${encodeURIComponent(id)}`, {
            method: 'GET',
            headers: this.authGetHeaders(),
        });
    }

    public async payInvoice(id: string): Promise<unknown> {
        return this.makeRequest<unknown>(`invoices/${encodeURIComponent(id)}/pay`, {
            method: 'POST',
            headers: this.authGetHeaders(),
        });
    }

    public async getOrders(input?: OrderListInput): Promise<unknown> {
        return this.makeRequest<unknown>(`orders${this.buildQueryString(input as Record<string, unknown>)}`, {
            method: 'GET',
            headers: this.authGetHeaders(),
        });
    }

    public async getOrderById(id: string): Promise<unknown> {
        return this.makeRequest<unknown>(`orders/${encodeURIComponent(id)}`, {
            method: 'GET',
            headers: this.authGetHeaders(),
        });
    }

    // --- esims account ---

    public async createEsimInvoice(body: CreateEsimInvoiceInput): Promise<unknown> {
        return this.makeRequest<unknown>('esims', {
            method: 'POST',
            headers: this.authJsonHeaders(),
            body: JSON.stringify(body),
        });
    }

    public async getEsimInvoice(id: string): Promise<unknown> {
        return this.makeRequest<unknown>(`esims/invoice/${encodeURIComponent(id)}`, {
            method: 'GET',
            headers: this.authGetHeaders(),
        });
    }

    public async payEsimInvoice(id: string): Promise<unknown> {
        return this.makeRequest<unknown>(`esims/invoice/${encodeURIComponent(id)}/pay`, {
            method: 'POST',
            headers: this.authGetHeaders(),
        });
    }

    public async listEsims(input?: EsimListInput): Promise<ListEnvelope<EsimListItem[]>> {
        return this.makeRequest<ListEnvelope<EsimListItem[]>>(
            `esims${this.buildQueryString(input as Record<string, unknown>)}`,
            { method: 'GET', headers: this.authGetHeaders() }
        );
    }

    public async getEsim(iccid: string): Promise<Envelope<EsimListItem>> {
        return this.makeRequest<Envelope<EsimListItem>>(
            `esims/${encodeURIComponent(iccid)}`,
            { method: 'GET', headers: this.authGetHeaders() }
        );
    }

    // --- misc ---

    public async ping(): Promise<PingResponse> {
        return this.makeRequest<PingResponse>('ping', {
            method: 'GET',
            headers: this.authGetHeaders(),
        });
    }

    public async getAccountBalance(): Promise<unknown> {
        return this.makeRequest<unknown>('accounts/balance', {
            method: 'GET',
            headers: this.authGetHeaders(),
        });
    }

    public async checkPhoneNumber(
        phoneNumber: string,
        operator?: string
    ): Promise<unknown> {
        return this.makeRequest<unknown>(
            `check_phone_number${this.buildQueryString({ phone_number: phoneNumber, operator })}`,
            { method: 'GET', headers: this.authGetHeaders() }
        );
    }
}

export const authenticatedApiClient = new AuthenticatedApiClient();
