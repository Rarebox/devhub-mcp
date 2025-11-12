export interface StripeConfig {
    apiKey?: string;
}

export interface StripeCustomer {
    id: string;
    email: string;
    name: string;
    balance: number;
}

export interface StripePayment {
    id: string;
    amount: number;
    currency: string;
    status: string;
    created: number;
    customer: string;
}

export interface StripeSubscription {
    id: string;
    customer: string;
    status: string;
    current_period_start: number;
    current_period_end: number;
    plan_id: string;
}

export interface StripeCharge {
    id: string;
    amount: number;
    currency: string;
    status: string;
    created: number;
    customer: string;
}

export interface StripeProduct {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
}

export class StripeMcpServer {
    private apiKey: string | null = null;
    private isConnected: boolean = false;
    private baseUrl = 'https://api.stripe.com/v1';

    constructor(config?: StripeConfig) {
        if (config?.apiKey) {
            this.apiKey = config.apiKey;
        }
    }

    async connect(apiKey: string): Promise<boolean> {
        try {
            console.log('Connecting to Stripe...');
            
            this.apiKey = apiKey;
            
            // Test connection
            const response = await this.makeRequest('GET', '/account');
            console.log(`Connected to Stripe account: ${response.id}`);
            
            this.isConnected = true;
            return true;
            
        } catch (error) {
            console.error('Stripe connection error:', error);
            this.isConnected = false;
            this.apiKey = null;
            return false;
        }
    }

    async disconnect(): Promise<void> {
        this.apiKey = null;
        this.isConnected = false;
        console.log('Disconnected from Stripe');
    }

    getConnectionStatus(): boolean {
        return this.isConnected;
    }

    async listCustomers(limit: number = 10): Promise<StripeCustomer[]> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Stripe');
        }

        try {
            const response = await this.makeRequest('GET', `/customers?limit=${limit}`);
            return response.data.map((customer: any) => ({
                id: customer.id,
                email: customer.email || 'No email',
                name: customer.name || 'No name',
                balance: customer.balance || 0
            }));
        } catch (error) {
            console.error('Error listing customers:', error);
            throw error;
        }
    }

    async listCharges(limit: number = 10): Promise<StripePayment[]> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Stripe');
        }

        try {
            const response = await this.makeRequest('GET', `/charges?limit=${limit}`);
            return response.data.map((charge: any) => ({
                id: charge.id,
                amount: charge.amount / 100,
                currency: charge.currency.toUpperCase(),
                status: charge.status,
                created: charge.created,
                customer: charge.customer || 'No customer'
            }));
        } catch (error) {
            console.error('Error listing charges:', error);
            throw error;
        }
    }

    async createCustomer(email: string, name?: string, description?: string): Promise<StripeCustomer> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Stripe');
        }

        try {
            const customerData = {
                email,
                ...(name && { name }),
                ...(description && { description })
            };

            const response = await this.makeRequest('POST', '/customers', customerData);
            return {
                id: response.id,
                email: response.email,
                name: response.name || 'No name',
                balance: response.balance || 0
            };
        } catch (error) {
            console.error('Error creating customer:', error);
            throw error;
        }
    }

    async getCustomer(customerId: string): Promise<StripeCustomer> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Stripe');
        }

        try {
            const response = await this.makeRequest('GET', `/customers/${customerId}`);
            return {
                id: response.id,
                email: response.email || 'No email',
                name: response.name || 'No name',
                balance: response.balance || 0
            };
        } catch (error) {
            console.error('Error getting customer:', error);
            throw error;
        }
    }

    async createCharge(amount: number, currency: string = 'usd', source?: string, description?: string, customerId?: string): Promise<StripeCharge> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Stripe');
        }

        try {
            const chargeData = {
                amount: amount * 100, // Convert to cents
                currency,
                ...(source && { source }),
                ...(description && { description }),
                ...(customerId && { customer: customerId })
            };

            const response = await this.makeRequest('POST', '/charges', chargeData);
            return {
                id: response.id,
                amount: response.amount / 100,
                currency: response.currency.toUpperCase(),
                status: response.status,
                created: response.created,
                customer: response.customer || 'No customer'
            };
        } catch (error) {
            console.error('Error creating charge:', error);
            throw error;
        }
    }

    async listProducts(limit: number = 10): Promise<StripeProduct[]> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Stripe');
        }

        try {
            const response = await this.makeRequest('GET', `/products?limit=${limit}`);
            return response.data.map((product: any) => ({
                id: product.id,
                name: product.name,
                description: product.description || 'No description',
                price: product.default_price ? product.default_price.unit_amount / 100 : 0,
                currency: product.default_price ? product.default_price.currency : 'usd'
            }));
        } catch (error) {
            console.error('Error listing products:', error);
            throw error;
        }
    }

    async createProduct(name: string, description?: string, price?: number, currency: string = 'usd'): Promise<StripeProduct> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Stripe');
        }

        try {
            const productData = {
                name,
                ...(description && { description }),
                ...(price && {
                    default_price_data: {
                        unit_amount: price * 100,
                        currency
                    }
                })
            };

            const response = await this.makeRequest('POST', '/products', productData);
            return {
                id: response.id,
                name: response.name,
                description: response.description || 'No description',
                price: response.default_price ? response.default_price.unit_amount / 100 : 0,
                currency: response.default_price ? response.default_price.currency : 'usd'
            };
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    }

    async listSubscriptions(limit: number = 10): Promise<StripeSubscription[]> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Stripe');
        }

        try {
            const response = await this.makeRequest('GET', `/subscriptions?limit=${limit}`);
            return response.data.map((sub: any) => ({
                id: sub.id,
                customer: sub.customer,
                status: sub.status,
                current_period_start: sub.current_period_start,
                current_period_end: sub.current_period_end,
                plan_id: sub.items.data[0]?.plan.id || 'No plan'
            }));
        } catch (error) {
            console.error('Error listing subscriptions:', error);
            throw error;
        }
    }

    private async makeRequest(method: string, endpoint: string, data?: any): Promise<any> {
        const url = `${this.baseUrl}${endpoint}`;
        const auth = Buffer.from(`${this.apiKey}:`).toString('base64');

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                },
                ...(data && { body: JSON.stringify(data) })
            });

            if (!response.ok) {
                throw new Error(`Stripe API error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Request error:', error);
            throw error;
        }
    }
}
