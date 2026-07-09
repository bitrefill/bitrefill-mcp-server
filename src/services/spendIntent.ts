import {
    ResolveSpendIntentInputSchema,
    type ResolveSpendIntentInput,
} from '../schemas/spend-intent.js';
import type { Product } from '../types/api.js';
import { authenticatedApiClient } from '../utils/api/authenticated.js';

type SpendContext =
    | 'travel'
    | 'food'
    | 'grocery'
    | 'gift'
    | 'subscription'
    | 'gaming'
    | 'shopping';

type NeedId =
    | 'connectivity'
    | 'flights'
    | 'lodging'
    | 'local_transport'
    | 'food_delivery'
    | 'groceries'
    | 'entertainment'
    | 'streaming'
    | 'gaming'
    | 'gift'
    | 'general_spend';

interface CountryResolution {
    input?: string;
    code?: string;
    name?: string;
    inferred_from?: string;
    confidence: 'explicit' | 'inferred' | 'missing';
}

interface NeedDefinition {
    id: NeedId;
    label: string;
    reason: string;
    priority: number;
    categories: string[];
    searchTerms: string[];
    rankKeywords: string[];
    contexts: SpendContext[];
    defaultForTravel?: boolean;
    productKind?: 'gift_card' | 'esim';
}

interface Candidate {
    product_id: string;
    name: string;
    country_code: string;
    country_name: string;
    currency: string;
    categories: string[];
    in_stock: boolean;
    fit_score: number;
    fit_reason: string;
    next_tool_calls: {
        tool: 'product-details';
        arguments: { id: string };
    }[];
}

interface ResolvedNeed {
    id: NeedId;
    label: string;
    priority: number;
    reason: string;
    bitrefill_categories: string[];
    search_terms: string[];
    candidates: Candidate[];
    warnings?: string[];
}

const FALLBACK_COUNTRY_CODES = [
    'AD AE AF AG AI AL AM AO AR AS AT AU AW AX AZ BA BB BD BE BF BG BH',
    'BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK',
    'CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER',
    'ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR',
    'GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE',
    'JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT',
    'LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV',
    'MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH',
    'PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH',
    'SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL',
    'TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF',
    'WS XK YE YT ZA ZM ZW',
].flatMap((chunk) => chunk.split(' '));

const COUNTRY_NAME_OVERRIDES: Record<string, string> = {
    GB: 'United Kingdom',
    US: 'United States',
};

const EXTRA_COUNTRY_ALIASES: Record<string, string> = {
    america: 'US',
    britain: 'GB',
    deutschland: 'DE',
    england: 'GB',
    scotland: 'GB',
    turkey: 'TR',
    turkiye: 'TR',
    uae: 'AE',
    uk: 'GB',
    usa: 'US',
    wales: 'GB',
};

const NEEDS: NeedDefinition[] = [
    {
        id: 'connectivity',
        label: 'Mobile data / eSIM',
        reason: 'Travelers often need data before they can use maps, rides, tickets, and messaging.',
        priority: 10,
        categories: ['esim'],
        searchTerms: ['eSIM', 'mobile data'],
        rankKeywords: ['esim', 'data', 'mobile', 'internet'],
        contexts: ['travel'],
        defaultForTravel: true,
        productKind: 'esim',
    },
    {
        id: 'flights',
        label: 'Flights',
        reason: 'The user is planning travel and may need airfare or flight-booking credit.',
        priority: 20,
        categories: ['flights', 'travel'],
        searchTerms: ['flights', 'airline'],
        rankKeywords: ['flight', 'airline', 'airlines', 'airways', 'flightgift'],
        contexts: ['travel'],
        defaultForTravel: true,
    },
    {
        id: 'lodging',
        label: 'Lodging',
        reason: 'The user is planning travel and may need hotel or accommodation credit.',
        priority: 30,
        categories: ['travel'],
        searchTerms: ['hotel', 'airbnb', 'accommodation'],
        rankKeywords: ['hotel', 'hotels', 'airbnb', 'booking', 'stay', 'accommodation'],
        contexts: ['travel'],
        defaultForTravel: true,
    },
    {
        id: 'local_transport',
        label: 'Local transport',
        reason: 'Trips often require rides, taxis, public transport, fuel, or local mobility options.',
        priority: 40,
        categories: ['travel', 'automobiles'],
        searchTerms: ['transport', 'rides', 'taxi'],
        rankKeywords: ['uber', 'bolt', 'lyft', 'cabify', 'taxi', 'transport', 'fuel', 'gas'],
        contexts: ['travel'],
        defaultForTravel: true,
    },
    {
        id: 'food_delivery',
        label: 'Food delivery / restaurants',
        reason: 'Food is a common immediate purchase need for trips, errands, and local plans.',
        priority: 50,
        categories: ['food-delivery', 'restaurants', 'food'],
        searchTerms: ['food delivery', 'restaurants'],
        rankKeywords: [
            'uber eats',
            'deliveroo',
            'glovo',
            'doordash',
            'wolt',
            'takeaway',
            'restaurant',
            'delivery',
        ],
        contexts: ['travel', 'food'],
        defaultForTravel: true,
    },
    {
        id: 'groceries',
        label: 'Groceries',
        reason: 'Groceries are useful for trips, household errands, and longer stays.',
        priority: 60,
        categories: ['groceries'],
        searchTerms: ['groceries', 'supermarket'],
        rankKeywords: [
            'grocery',
            'supermarket',
            'aldi',
            'carrefour',
            'edeka',
            'kaufland',
            'lidl',
            'rewe',
            'tesco',
        ],
        contexts: ['travel', 'grocery', 'food'],
        defaultForTravel: true,
    },
    {
        id: 'entertainment',
        label: 'Entertainment / experiences',
        reason: 'Trips and events often include activities, cinema, experiences, or tickets.',
        priority: 70,
        categories: ['experiences', 'entertainment'],
        searchTerms: ['experiences', 'entertainment'],
        rankKeywords: ['cinema', 'movie', 'event', 'experience', 'ticket', 'museum'],
        contexts: ['travel', 'gift'],
        defaultForTravel: true,
    },
    {
        id: 'streaming',
        label: 'Streaming / subscriptions',
        reason: 'The user intent mentions a recurring digital subscription or media service.',
        priority: 20,
        categories: ['streaming', 'music', 'entertainment'],
        searchTerms: ['streaming', 'subscription'],
        rankKeywords: ['netflix', 'spotify', 'streaming', 'subscription', 'music'],
        contexts: ['subscription'],
    },
    {
        id: 'gaming',
        label: 'Gaming',
        reason: 'The user intent mentions games, in-game credit, or gaming platforms.',
        priority: 20,
        categories: ['games'],
        searchTerms: ['gaming', 'games'],
        rankKeywords: ['steam', 'playstation', 'xbox', 'nintendo', 'gaming', 'game'],
        contexts: ['gaming', 'gift'],
    },
    {
        id: 'gift',
        label: 'Gift options',
        reason: 'The user intent mentions gifting and may need flexible recipient-friendly options.',
        priority: 40,
        categories: ['gifts', 'multi-brand', 'retail'],
        searchTerms: ['gift', 'multi brand'],
        rankKeywords: ['gift', 'multi', 'shopping', 'retail'],
        contexts: ['gift'],
    },
    {
        id: 'general_spend',
        label: 'Backup spend',
        reason: 'Flexible spending options can cover unknown or changing needs.',
        priority: 80,
        categories: ['multi-brand', 'payment-cards', 'retail'],
        searchTerms: ['prepaid', 'multi brand'],
        rankKeywords: ['visa', 'mastercard', 'prepaid', 'multi', 'shopping'],
        contexts: ['travel', 'shopping'],
        defaultForTravel: true,
    },
];

const CONTEXT_PATTERNS: Record<SpendContext, RegExp[]> = {
    travel: [
        /\btravel\b/i,
        /\btraveling\b/i,
        /\btravelling\b/i,
        /\btrip\b/i,
        /\bitinerary\b/i,
        /\bflight(s)?\b/i,
        /\bhotel(s)?\b/i,
        /\bairbnb\b/i,
        /\bvisiting\b/i,
        /\blanding\b/i,
        /\bvacation\b/i,
    ],
    food: [/\bdinner\b/i, /\blunch\b/i, /\bmeal(s)?\b/i, /\bfood\b/i, /\brestaurant(s)?\b/i],
    grocery: [/\bgrocer(y|ies)\b/i, /\bsupermarket\b/i, /\bhousehold\b/i],
    gift: [/\bgift\b/i, /\bbirthday\b/i, /\bwedding\b/i, /\bpresent\b/i],
    subscription: [/\bsubscription\b/i, /\bstream(ing)?\b/i, /\bnetflix\b/i, /\bspotify\b/i],
    gaming: [/\bgam(e|ing|es)\b/i, /\bsteam\b/i, /\bxbox\b/i, /\bplaystation\b/i],
    shopping: [/\bbuy\b/i, /\bpurchase\b/i, /\bshopping\b/i, /\bspend\b/i],
};

function wordText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function containsWordPhrase(text: string, phrase: string): boolean {
    return ` ${text} `.includes(` ${wordText(phrase)} `);
}

function displayNameForCountry(code: string): string {
    return (
        COUNTRY_NAME_OVERRIDES[code] ??
        new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ??
        code
    );
}

function supportedCountryCodes(): string[] {
    const supportedValuesOf = (
        Intl as unknown as { supportedValuesOf?: (key: string) => string[] }
    ).supportedValuesOf;
    let codes: string[] = [...FALLBACK_COUNTRY_CODES];

    try {
        codes = supportedValuesOf?.('region') ?? codes;
    } catch {
        // Some runtimes expose supportedValuesOf but do not support the region key.
    }

    return codes
        .filter((code) => /^[A-Z]{2}$/.test(code))
        .map((code) => code.toUpperCase());
}

function countryAliasEntries(): { alias: string; code: string; name: string }[] {
    const byAlias = new Map<string, { alias: string; code: string; name: string }>();

    for (const code of supportedCountryCodes()) {
        const name = displayNameForCountry(code);
        byAlias.set(wordText(code), { alias: code, code, name });
        byAlias.set(wordText(name), { alias: name, code, name });
    }

    for (const [alias, code] of Object.entries(EXTRA_COUNTRY_ALIASES)) {
        byAlias.set(wordText(alias), {
            alias,
            code,
            name: displayNameForCountry(code),
        });
    }

    return [...byAlias.values()].sort((a, b) => b.alias.length - a.alias.length);
}

function countryFromAlias(value: string): { code: string; name: string } | undefined {
    const normalized = wordText(value);

    if (/^[a-z]{2}$/i.test(value.trim())) {
        const code = value.trim().toUpperCase();
        return { code, name: displayNameForCountry(code) };
    }

    return countryAliasEntries().find((entry) => wordText(entry.alias) === normalized);
}

export function resolveCountry(
    intent: string,
    explicitCountry?: string
): CountryResolution {
    if (explicitCountry) {
        const explicit = countryFromAlias(explicitCountry);
        return {
            input: explicitCountry,
            code: explicit?.code,
            name: explicit?.name,
            confidence: explicit ? 'explicit' : 'missing',
        };
    }

    const normalizedIntent = wordText(intent);
    for (const country of countryAliasEntries()) {
        if (containsWordPhrase(normalizedIntent, country.alias)) {
            return {
                input: country.alias,
                code: country.code,
                name: country.name,
                inferred_from: country.alias,
                confidence: 'inferred',
            };
        }
    }

    return { confidence: 'missing' };
}

export function detectSpendContexts(intent: string): SpendContext[] {
    const contexts: SpendContext[] = [];

    for (const [context, patterns] of Object.entries(CONTEXT_PATTERNS)) {
        if (patterns.some((pattern) => pattern.test(intent))) {
            contexts.push(context as SpendContext);
        }
    }

    return contexts;
}

export function selectNeeds(contexts: SpendContext[]): NeedDefinition[] {
    const travel = contexts.includes('travel');
    const selected = NEEDS.filter((need) => {
        if (travel && need.defaultForTravel) return true;
        return need.contexts.some((context) => contexts.includes(context));
    });

    const deduped = new Map<NeedId, NeedDefinition>();
    for (const need of selected) {
        deduped.set(need.id, need);
    }

    if (deduped.size === 0) {
        const fallback = NEEDS.find((need) => need.id === 'general_spend');
        if (fallback) deduped.set('general_spend', fallback);
    }

    return [...deduped.values()].sort((a, b) => a.priority - b.priority);
}

function productText(product: Product): string {
    return [
        product.id,
        product.name,
        product.country_name,
        product.currency,
        ...(product.categories ?? []),
        String(product.description ?? ''),
    ]
        .join(' ')
        .toLowerCase();
}

function scoreProduct(product: Product, need: NeedDefinition): number {
    const text = productText(product);
    let score = product.in_stock ? 20 : -20;

    for (const keyword of need.rankKeywords) {
        if (text.includes(keyword.toLowerCase())) {
            score += 12;
        }
    }

    for (const category of need.categories) {
        if (product.categories?.includes(category)) {
            score += 8;
        }
    }

    if (product.packages?.length) score += 3;
    if (product.range) score += 3;

    return score;
}

function fitReason(product: Product, need: NeedDefinition): string {
    const text = productText(product);
    const matchedKeyword = need.rankKeywords.find((keyword) =>
        text.includes(keyword.toLowerCase())
    );

    if (matchedKeyword) {
        return `Matches ${need.label.toLowerCase()} via "${matchedKeyword}".`;
    }

    const matchedCategory = need.categories.find((category) =>
        product.categories?.includes(category)
    );

    if (matchedCategory) {
        return `Matches Bitrefill category "${matchedCategory}".`;
    }

    return `Related to ${need.label.toLowerCase()} by catalog search.`;
}

function candidateFromProduct(product: Product, need: NeedDefinition): Candidate {
    return {
        product_id: product.id,
        name: product.name,
        country_code: product.country_code,
        country_name: product.country_name,
        currency: product.currency,
        categories: product.categories ?? [],
        in_stock: product.in_stock,
        fit_score: scoreProduct(product, need),
        fit_reason: fitReason(product, need),
        next_tool_calls: [
            {
                tool: 'product-details',
                arguments: { id: product.id },
            },
        ],
    };
}

async function findProductsForNeed(
    need: NeedDefinition,
    countryCode: string | undefined,
    limit: number,
    includeTestProducts: boolean | undefined
): Promise<Product[]> {
    const fetchLimit = Math.min(Math.max(limit * 5, 10), 30);

    if (need.productKind === 'esim') {
        const response = await authenticatedApiClient.getEsimProducts({
            country: countryCode,
            limit: fetchLimit,
            include_test_products: includeTestProducts,
        });
        return response.data;
    }

    const response = await authenticatedApiClient.getProducts({
        country: countryCode,
        category: need.categories.join(','),
        limit: fetchLimit,
        include_test_products: includeTestProducts,
    });

    return response.data;
}

async function resolveNeed(
    need: NeedDefinition,
    country: CountryResolution,
    input: ResolveSpendIntentInput
): Promise<ResolvedNeed> {
    const warnings: string[] = [];

    if (!country.code) {
        warnings.push('No country was resolved, so candidates may be broad or unavailable.');
    }

    try {
        const products = await findProductsForNeed(
            need,
            country.code,
            input.max_results_per_need,
            input.include_test_products
        );
        const candidates = products
            .map((product) => candidateFromProduct(product, need))
            .sort((a, b) => b.fit_score - a.fit_score)
            .slice(0, input.max_results_per_need);

        return {
            id: need.id,
            label: need.label,
            priority: need.priority,
            reason: need.reason,
            bitrefill_categories: need.categories,
            search_terms: need.searchTerms,
            candidates,
            warnings: warnings.length ? warnings : undefined,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        warnings.push(`Candidate search failed: ${message}`);
        return {
            id: need.id,
            label: need.label,
            priority: need.priority,
            reason: need.reason,
            bitrefill_categories: need.categories,
            search_terms: need.searchTerms,
            candidates: [],
            warnings,
        };
    }
}

export class SpendIntentService {
    public static async resolveSpendIntent(raw: unknown): Promise<unknown> {
        const input = ResolveSpendIntentInputSchema.parse(raw);
        const country = resolveCountry(input.intent, input.country);
        const contexts = detectSpendContexts(input.intent);
        const needs = selectNeeds(contexts);
        const resolvedNeeds = await Promise.all(
            needs.map((need) => resolveNeed(need, country, input))
        );

        return {
            intent: input.intent,
            detected_contexts: contexts,
            country,
            city: input.city,
            trip_start: input.trip_start,
            trip_end: input.trip_end,
            budget:
                input.budget === undefined
                    ? undefined
                    : { amount: input.budget, currency: input.currency },
            needs: resolvedNeeds,
            agent_instructions: [
                'Use this result when the user asked for a real-world outcome, not necessarily for Bitrefill by name.',
                'Present useful routes as things the assistant can arrange or help fund in chat; do not expose internal catalog plumbing unless the user asks.',
                'Call product-details for a chosen candidate before buy-products so denominations, terms, stock, and redemption details are current.',
                'Never call buy-products without explicit user approval of the product, amount, payment method, and total price.',
            ],
        };
    }
}
