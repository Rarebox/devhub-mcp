export interface LemonSqueezyConfig {
    apiKey?: string;
}

export interface LemonSqueezyProduct {
    id: string;
    name: string;
    price: number;
    currency: string;
    description: string;
}

export interface LemonSqueezyOrder {
    id: string;
    customer_email: string;
    total: number;
    currency: string;
    created_at: string;
    status: string;
}

export interface LemonSqueezySubscription {
    id: string;
    customer_email: string;
    status: string;
    plan_name: string;
    renews_at: string;
}

export class LemonSqueezyMcpServer {
    private apiKey: string | null = null;
    private isConnected: boolean = false;
    private baseUrl = 'https://api.lemonsqueezy.com/v1';

    constructor(config?: LemonSqueezyConfig) {
        if (config?.apiKey) {
            this.apiKey = config.apiKey;
        }
    }

    async connect(apiKey: string): Promise<boolean> {
        try {
            console.log('Connecting to LemonSqueezy...');
            
            this.apiKey = apiKey;
            
            // Test connection
            const response = await this.makeRequest('GET', '/me');
            console.log(`Connected to LemonSqueezy: ${response.data.attributes.name}`);
            
            this.isConnected = true;
            return true;
            
        } catch (error) {
            console.error('LemonSqueezy connection error:', error);
            this.isConnected = false;
            this.apiKey = null;
            return false;
        }
    }

    async disconnect(): Promise<void> {
        this.apiKey = null;
        this.isConnected = false;
        console.log('Disconnected from LemonSqueezy');
    }

    getConnectionStatus(): boolean {
        return this.isConnected;
    }

    async listProducts(storeId: string): Promise<LemonSqueezyProduct[]> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to LemonSqueezy');
        }

        try {
            const response = await this.makeRequest('GET', `/stores/${storeId}/products`);
            return response.data.map((product: any) => ({
                id: product.id,
                name: product.attributes.name,
                price: product.attributes.price / 100,
                currency: product.attributes.currency,
                description: product.attributes.description
            }));
        } catch (error) {
            console.error('Error listing products:', error);
            throw error;
        }
    }

    async listOrders(storeId: string): Promise<LemonSqueezyOrder[]> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to LemonSqueezy');
        }

        try {
            const response = await this.makeRequest('GET', `/stores/${storeId}/orders`);
            return response.data.map((order: any) => ({
                id: order.id,
                customer_email: order.attributes.customer_email,
                total: order.attributes.total / 100,
                currency: order.attributes.currency,
                created_at: order.attributes.created_at,
                status: order.attributes.status
            }));
        } catch (error) {
            console.error('Error listing orders:', error);
            throw error;
        }
    }

    async listSubscriptions(storeId: string): Promise<LemonSqueezySubscription[]> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to LemonSqueezy');
        }

        try {
            const response = await this.makeRequest('GET', `/stores/${storeId}/subscriptions`);
            return response.data.map((sub: any) => ({
                id: sub.id,
                customer_email: sub.attributes.customer_email,
                status: sub.attributes.status,
                plan_name: sub.attributes.plan_name,
                renews_at: sub.attributes.renews_at
            }));
        } catch (error) {
            console.error('Error listing subscriptions:', error);
            throw error;
        }
    }

    private async makeRequest(method: string, endpoint: string): Promise<any> {
        const url = `${this.baseUrl}${endpoint}`;

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Accept': 'application/vnd.api+json'
                }
            });

            if (!response.ok) {
                throw new Error(`LemonSqueezy API error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Request error:', error);
            throw error;
        }
    }
}
