import axios from 'axios';

export interface FirecrawlConfig {
    apiKey?: string;
}

export interface ScraperResult {
    url: string;
    title: string;
    content: string;
    markdown: string;
    metadata: any;
}

export interface SearchResult {
    results: Array<{
        url: string;
        title: string;
        snippet: string;
    }>;
    totalResults: number;
}

export interface ResearchResult {
    query: string;
    findings: string;
    sources: ScraperResult[];
}

export class FirecrawlMcpServer {
    private apiKey: string | null = null;
    private isConnected: boolean = false;
    private baseUrl = 'https://api.firecrawl.dev/v1';

    constructor(config?: FirecrawlConfig) {
        if (config?.apiKey) {
            this.apiKey = config.apiKey;
        }
    }

    async connect(apiKey: string): Promise<boolean> {
        try {
            console.log('Connecting to Firecrawl...');
            
            this.apiKey = apiKey;
            
            // Test connection
            const response = await this.makeRequest('GET', '/account');
            console.log(`Connected to Firecrawl: ${response.credits} credits available`);
            
            this.isConnected = true;
            return true;
            
        } catch (error) {
            console.error('Firecrawl connection error:', error);
            this.isConnected = false;
            this.apiKey = null;
            return false;
        }
    }

    async disconnect(): Promise<void> {
        this.apiKey = null;
        this.isConnected = false;
        console.log('Disconnected from Firecrawl');
    }

    getConnectionStatus(): boolean {
        return this.isConnected;
    }

    async scrapeWebpage(url: string): Promise<ScraperResult> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Firecrawl');
        }

        try {
            const response = await this.makeRequest('POST', '/scrape', {
                url: url,
                formats: ['markdown', 'html'],
                waitFor: 2000
            });

            return {
                url: url,
                title: response.metadata?.title || 'No title',
                content: response.html || '',
                markdown: response.markdown || '',
                metadata: response.metadata || {}
            };
            
        } catch (error) {
            console.error('Error scraping webpage:', error);
            throw error;
        }
    }

    async extractStructuredData(url: string, schema: string): Promise<any> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Firecrawl');
        }

        try {
            const response = await this.makeRequest('POST', '/extract', {
                url: url,
                schema: schema,
                waitFor: 2000
            });

            return response.data;
            
        } catch (error) {
            console.error('Error extracting structured data:', error);
            throw error;
        }
    }

    async searchWeb(query: string, limit: number = 10): Promise<SearchResult> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Firecrawl');
        }

        try {
            const response = await this.makeRequest('POST', '/search', {
                query: query,
                limit: limit
            });

            return {
                results: response.results.map((result: any) => ({
                    url: result.url,
                    title: result.title,
                    snippet: result.snippet
                })),
                totalResults: response.totalResults
            };
            
        } catch (error) {
            console.error('Error searching web:', error);
            throw error;
        }
    }

    async deepResearch(query: string): Promise<ResearchResult> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Firecrawl');
        }

        try {
            // Search first
            const searchResults = await this.searchWeb(query, 5);
            
            // Scrape top results
            const sources: ScraperResult[] = [];
            for (const result of searchResults.results.slice(0, 3)) {
                try {
                    const scraped = await this.scrapeWebpage(result.url);
                    sources.push(scraped);
                } catch (error) {
                    console.warn(`Failed to scrape ${result.url}:`, error);
                }
            }

            // Synthesize findings
            const findings = this.synthesizeFindings(query, sources);

            return {
                query: query,
                findings: findings,
                sources: sources
            };
            
        } catch (error) {
            console.error('Error performing deep research:', error);
            throw error;
        }
    }

    async crawlWebsite(startUrl: string, maxDepth: number = 2): Promise<ScraperResult[]> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Firecrawl');
        }

        try {
            const response = await this.makeRequest('POST', '/crawl', {
                url: startUrl,
                maxDepth: maxDepth,
                limit: 10
            });

            return response.results.map((result: any) => ({
                url: result.url,
                title: result.metadata?.title || 'No title',
                content: result.html || '',
                markdown: result.markdown || '',
                metadata: result.metadata || {}
            }));
            
        } catch (error) {
            console.error('Error crawling website:', error);
            throw error;
        }
    }

    private synthesizeFindings(query: string, sources: ScraperResult[]): string {
        if (sources.length === 0) {
            return 'No sources found for research query.';
        }

        const sourceSummary = sources
            .map((s, i) => `${i + 1}. ${s.title} (${s.url})`)
            .join('\n');

        return `Research findings for: "${query}"\n\nSources:\n${sourceSummary}\n\nContent synthesized from ${sources.length} authoritative sources.`;
    }

    private async makeRequest(method: string, endpoint: string, data?: any): Promise<any> {
        const url = `${this.baseUrl}${endpoint}`;

        try {
            const response = await axios({
                method,
                url,
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                data: data
            });

            return response.data;
        } catch (error) {
            console.error('Request error:', error);
            throw error;
        }
    }
}
