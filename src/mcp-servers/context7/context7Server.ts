import axios from 'axios';

export interface Context7Config {
    apiKey?: string;
}

export interface DocumentationResult {
    title: string;
    content: string;
    version: string;
    url: string;
    lastUpdated: string;
}

export interface SearchResult {
    results: DocumentationResult[];
    totalResults: number;
}

export class Context7McpServer {
    private apiKey: string | null = null;
    private isConnected: boolean = false;
    private baseUrl = 'https://api.context7.dev/v1';

    constructor(config?: Context7Config) {
        if (config?.apiKey) {
            this.apiKey = config.apiKey;
        }
    }

    async connect(apiKey: string): Promise<boolean> {
        try {
            console.log('Connecting to Context 7...');
            
            this.apiKey = apiKey;
            
            // Test connection
            const response = await this.makeRequest('GET', '/health');
            console.log('Connected to Context 7');
            
            this.isConnected = true;
            return true;
            
        } catch (error) {
            console.error('Context 7 connection error:', error);
            this.isConnected = false;
            this.apiKey = null;
            return false;
        }
    }

    async disconnect(): Promise<void> {
        this.apiKey = null;
        this.isConnected = false;
        console.log('Disconnected from Context 7');
    }

    getConnectionStatus(): boolean {
        return this.isConnected;
    }

    async searchDocumentation(query: string): Promise<SearchResult> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Context 7');
        }

        try {
            const response = await this.makeRequest('GET', `/search?q=${encodeURIComponent(query)}`);
            return {
                results: response.data.map((doc: any) => ({
                    title: doc.title,
                    content: doc.content,
                    version: doc.version,
                    url: doc.url,
                    lastUpdated: doc.lastUpdated
                })),
                totalResults: response.total
            };
        } catch (error) {
            console.error('Error searching documentation:', error);
            throw error;
        }
    }

    async getLatestDocumentation(topic: string): Promise<DocumentationResult> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Context 7');
        }

        try {
            const response = await this.makeRequest('GET', `/docs/latest/${topic}`);
            return {
                title: response.title,
                content: response.content,
                version: response.version,
                url: response.url,
                lastUpdated: response.lastUpdated
            };
        } catch (error) {
            console.error('Error fetching documentation:', error);
            throw error;
        }
    }

    async getVersionSpecificDocs(topic: string, version: string): Promise<DocumentationResult> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Context 7');
        }

        try {
            const response = await this.makeRequest('GET', `/docs/${topic}/${version}`);
            return {
                title: response.title,
                content: response.content,
                version: response.version,
                url: response.url,
                lastUpdated: response.lastUpdated
            };
        } catch (error) {
            console.error('Error fetching version-specific docs:', error);
            throw error;
        }
    }

    private async makeRequest(method: string, endpoint: string): Promise<any> {
        const url = `${this.baseUrl}${endpoint}`;

        try {
            const response = await axios({
                method,
                url,
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Accept': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Request error:', error);
            throw error;
        }
    }
}
