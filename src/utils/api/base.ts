import { logError } from '../index.js';

export const DEFAULT_HEADERS: HeadersInit = {
    accept: 'application/json',
    'accept-language': 'en-US,en;q=0.9',
};

const RATELIMIT_HEADERS = [
    'ratelimit-limit',
    'ratelimit-remaining',
    'ratelimit-reset',
    'ratelimit-policy',
] as const;

export interface BitrefillApiErrorBody {
    message?: string;
    error_code?: string;
    status?: string;
    meta?: Record<string, unknown>;
}

/** Non-2xx or unparseable JSON from Bitrefill. */
export class BitrefillApiError extends Error {
    public readonly httpStatus: number;

    public readonly errorCode?: string;

    public readonly apiStatus?: string;

    public readonly body: BitrefillApiErrorBody | null;

    public readonly rateLimit: Partial<Record<(typeof RATELIMIT_HEADERS)[number], string>>;

    constructor(
        message: string,
        options: {
            httpStatus: number;
            body: BitrefillApiErrorBody | null;
            rateLimit: Partial<Record<(typeof RATELIMIT_HEADERS)[number], string>>;
        }
    ) {
        super(message);
        this.name = 'BitrefillApiError';
        this.httpStatus = options.httpStatus;
        this.body = options.body;
        this.rateLimit = options.rateLimit;
        this.errorCode = options.body?.error_code;
        this.apiStatus = options.body?.status;
    }
}

function collectRateLimitHeaders(response: Response): Partial<Record<(typeof RATELIMIT_HEADERS)[number], string>> {
    const out: Partial<Record<(typeof RATELIMIT_HEADERS)[number], string>> = {};
    for (const h of RATELIMIT_HEADERS) {
        const v = response.headers.get(h);
        if (v) out[h] = v;
    }
    return out;
}

function parseErrorJson(text: string): BitrefillApiErrorBody | null {
    try {
        return JSON.parse(text) as BitrefillApiErrorBody;
    } catch {
        return null;
    }
}

export abstract class BaseApiClient {
    protected abstract readonly baseUrl: string;

    protected abstract readonly context: string;

    protected buildQueryString(params?: Record<string, unknown>): string {
        if (!params) return '';

        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        });

        const queryString = searchParams.toString();
        return queryString ? `?${queryString}` : '';
    }

    protected async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = this.buildUrl(endpoint);

        try {
            if (!options.headers) {
                options.headers = DEFAULT_HEADERS;
            }

            const response = await fetch(url, options);
            const rateLimit = collectRateLimitHeaders(response);
            const text = await response.text();

            if (!response.ok) {
                const body = text ? parseErrorJson(text) : null;
                const msg =
                    body?.message ||
                    (text && text.length < 500 ? text : `HTTP ${response.status}`);
                const err = new BitrefillApiError(msg, {
                    httpStatus: response.status,
                    body,
                    rateLimit,
                });
                this.handleError(err);
                throw err;
            }

            if (!text) {
                return undefined as T;
            }

            try {
                return JSON.parse(text) as T;
            } catch (parseErr) {
                const err = new Error(`Invalid JSON from API: ${String(parseErr)}`);
                this.handleError(err);
                throw err;
            }
        } catch (error) {
            if (error instanceof BitrefillApiError) {
                throw error;
            }
            this.handleError(error);
            throw error;
        }
    }

    protected buildUrl(endpoint: string): string {
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
        const baseWithSlash = this.baseUrl.endsWith('/')
            ? this.baseUrl
            : `${this.baseUrl}/`;

        return `${baseWithSlash}${cleanEndpoint}`;
    }

    protected handleError(error: unknown): void {
        logError(
            error instanceof Error ? error : new Error(String(error)),
            this.context
        );
    }
}
