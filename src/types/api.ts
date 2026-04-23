/**
 * Loose TypeScript types for Bitrefill API v2 JSON responses.
 * Not validated at runtime — for documentation and editor inference only.
 */

export interface Envelope<T> {
    meta: Record<string, unknown>;
    data: T;
}

export interface ListMeta extends Record<string, unknown> {
    _endpoint: string;
    _next?: string;
    start?: number;
    limit?: number;
    count?: number;
    total_results?: number;
}

export interface ListEnvelope<T> {
    meta: ListMeta;
    data: T;
}

/** GET /v2/ping — `{ meta, message }` (no `data` key). */
export interface PingResponse {
    meta: { _endpoint: string };
    message: string;
}

export interface ProductPackage {
    id: string;
    value: string;
    price: number;
    amount?: number;
}

export interface ProductRange {
    min: number;
    max: number;
    step: number;
    price_rate: number;
}

export interface Product {
    id: string;
    name: string;
    country_code: string;
    country_name: string;
    currency: string;
    categories: string[];
    created_time: string;
    recipient_type: string;
    image: string;
    in_stock: boolean;
    termsAndConditions?: string;
    description?: string;
    packages: ProductPackage[];
    range?: ProductRange;
    [k: string]: unknown;
}

export interface EsimListItem {
    id: string;
    rsp_url?: string;
    pin?: string;
    barcode_value?: string;
    barcode_format?: string;
    user_email?: string;
    product: string;
    installed?: boolean;
    installed_time?: string;
    created_time?: string;
    access_token?: string;
    package_history?: EsimPackageHistoryItem[];
    [k: string]: unknown;
}

export interface EsimPackageHistoryItem {
    package_name: string;
    data_mb?: number;
    package_duration?: number;
    country?: string;
    order_id?: string;
    revoked?: boolean;
    bundle_end_time?: string;
    purchase_time?: string;
    status: string;
    remaining_quantity?: number;
    initial_quantity?: number;
    [k: string]: unknown;
}
