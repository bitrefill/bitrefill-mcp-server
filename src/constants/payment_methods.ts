/**
 * Payment methods accepted by POST /v2/invoices and POST /v2/esims (B2B create-invoice allowlist)
 */
export const paymentMethodEnum = [
    'balance',
    'bitcoin',
    'lightning',
    'ethereum',
    'usdc_base',
    'eth_base',
    'usdt_erc20',
    'usdc_erc20',
    'usdt_trc20',
    'usdc_polygon',
    'usdt_polygon',
    'usdc_arbitrum',
    'usdt_arbitrum',
    'eth_arbitrum',
    'usdc_solana',
    'usdt_solana',
    'solana',
    'usdt_lightning',
    'dogecoin',
    'dash',
    'litecoin',
    'ton',
    'usdt_ton',
] as const;

export const paymentMethods: string[] = [...paymentMethodEnum];

export type PaymentMethodId = (typeof paymentMethodEnum)[number];
