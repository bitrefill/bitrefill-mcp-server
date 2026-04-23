import { authenticatedApiClient } from '../utils/api/authenticated.js';
import type { Envelope, Product } from '../types/api.js';

export class ProductService {
    public static async getProductDetails(id: string): Promise<Envelope<Product>> {
        return authenticatedApiClient.getProductById(id);
    }
}
