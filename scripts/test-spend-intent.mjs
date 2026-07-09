import assert from 'node:assert/strict';

import {
    detectSpendContexts,
    resolveCountry,
    selectNeeds,
    SpendIntentService,
} from '../build/services/spendIntent.js';

const germanyTripCountry = resolveCountry('I am travelling to Germany next month');
assert.equal(germanyTripCountry.code, 'DE');
assert.equal(germanyTripCountry.confidence, 'inferred');

const germanyTripContexts = detectSpendContexts(
    'I am travelling to Germany next month, plan my itinerary'
);
assert.deepEqual(germanyTripContexts, ['travel']);

const travelNeeds = selectNeeds(germanyTripContexts).map((need) => need.id);
assert.ok(travelNeeds.includes('connectivity'));
assert.ok(travelNeeds.includes('lodging'));
assert.ok(travelNeeds.includes('food_delivery'));
assert.ok(travelNeeds.includes('general_spend'));

const portugalCountry = resolveCountry('buy groceries for tonight in Portugal');
assert.equal(portugalCountry.code, 'PT');

const streamingNeeds = selectNeeds(detectSpendContexts('renew Netflix for my account')).map(
    (need) => need.id
);
assert.deepEqual(streamingNeeds, ['streaming']);

const explicitCountry = resolveCountry('buy groceries in Lisbon', 'DE');
assert.equal(explicitCountry.code, 'DE');
assert.equal(explicitCountry.confidence, 'explicit');

const deutschlandCountry = resolveCountry('Ich reise nach Deutschland');
assert.equal(deutschlandCountry.code, 'DE');

process.env.BITREFILL_API_KEY = 'test-key';
const calls = [];
globalThis.fetch = async (url, options) => {
    const parsedUrl = new URL(String(url));
    calls.push({
        endpoint: parsedUrl.pathname,
        category: parsedUrl.searchParams.get('category'),
        country: parsedUrl.searchParams.get('country'),
        authorization: options?.headers?.authorization,
    });

    let data = [];

    if (parsedUrl.pathname === '/v2/products/esims') {
        data = [
            product({
                id: 'bitrefill-esim-germany',
                name: 'Germany eSIM',
                categories: ['esim'],
                packages: [{ id: '1GB', value: '1GB, 7 Days', price: 5 }],
            }),
        ];
    } else if (parsedUrl.searchParams.get('category')?.includes('groceries')) {
        data = [
            product({
                id: 'rewe-germany',
                name: 'REWE Gift Card',
                categories: ['groceries'],
                packages: [{ id: '25', value: '25', price: 25 }],
            }),
            product({
                id: 'other-grocery',
                name: 'Other Grocery',
                categories: ['groceries'],
                in_stock: false,
            }),
        ];
    } else if (parsedUrl.searchParams.get('category')?.includes('travel')) {
        data = [
            product({
                id: 'airbnb-germany',
                name: 'Airbnb Gift Card',
                categories: ['travel'],
                packages: [{ id: '100', value: '100', price: 100 }],
            }),
        ];
    }

    return new Response(JSON.stringify({ meta: { _endpoint: parsedUrl.pathname }, data }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
    });
};

const resolved = await SpendIntentService.resolveSpendIntent({
    intent: 'I am travelling to Germany next month, plan what I need',
    max_results_per_need: 2,
});

assert.equal(resolved.country.code, 'DE');
assert.equal(resolved.needs.find((need) => need.id === 'connectivity').candidates[0].product_id, 'bitrefill-esim-germany');
assert.equal(resolved.needs.find((need) => need.id === 'groceries').candidates[0].product_id, 'rewe-germany');
assert.ok(
    resolved.needs
        .find((need) => need.id === 'lodging')
        .candidates.some((candidate) => candidate.product_id === 'airbnb-germany')
);
assert.ok(resolved.agent_instructions.join(' ').includes('Never call buy-products'));
assert.ok(calls.every((call) => call.authorization === 'Bearer test-key'));
assert.ok(calls.some((call) => call.endpoint === '/v2/products/esims'));
assert.ok(calls.every((call) => call.country === 'DE'));

console.log('spend intent tests passed');

function product(overrides) {
    return {
        id: 'sample-product',
        name: 'Sample Product',
        country_code: 'DE',
        country_name: 'Germany',
        currency: 'EUR',
        categories: [],
        created_time: '',
        recipient_type: 'email',
        image: '',
        in_stock: true,
        packages: [],
        ...overrides,
    };
}
