export interface BrowserConfig {
    apiKey?: string;
}

export interface ConsoleLogs {
    type: string; // 'log', 'warn', 'error', 'info'
    message: string;
    timestamp: string;
    source: string;
}

export interface PageScreenshot {
    url: string;
    screenshotBase64: string;
    timestamp: string;
}

export interface NetworkRequest {
    url: string;
    method: string;
    status: number;
    size: number;
    duration: number;
    type: string;
}

export interface BrowserSession {
    url: string;
    title: string;
    consoleLogs: ConsoleLogs[];
    networkRequests: NetworkRequest[];
    pageSource: string;
}

export class BrowserMcpServer {
    private apiKey: string | null = null;
    private isConnected: boolean = false;
    private sessions: Map<string, BrowserSession> = new Map();

    constructor(config?: BrowserConfig) {
        if (config?.apiKey) {
            this.apiKey = config.apiKey;
        }
    }

    async connect(apiKey: string): Promise<boolean> {
        try {
            console.log('Connecting to Browser...');
            
            this.apiKey = apiKey;
            
            // Validate API key
            if (!apiKey || apiKey.length < 5) {
                throw new Error('Invalid API key');
            }

            console.log('Browser connected successfully');
            this.isConnected = true;
            return true;
            
        } catch (error) {
            console.error('Browser connection error:', error);
            this.isConnected = false;
            this.apiKey = null;
            return false;
        }
    }

    async disconnect(): Promise<void> {
        this.apiKey = null;
        this.isConnected = false;
        this.sessions.clear();
        console.log('Disconnected from Browser');
    }

    getConnectionStatus(): boolean {
        return this.isConnected;
    }

    async navigateToUrl(url: string): Promise<BrowserSession> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Browser');
        }

        try {
            const session: BrowserSession = {
                url: url,
                title: `Page: ${url}`,
                consoleLogs: [],
                networkRequests: [],
                pageSource: ''
            };

            this.sessions.set(url, session);
            console.log(`Navigated to: ${url}`);
            return session;
            
        } catch (error) {
            console.error('Error navigating to URL:', error);
            throw error;
        }
    }

    async captureConsoleLogs(url: string): Promise<ConsoleLogs[]> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Browser');
        }

        try {
            const session = this.sessions.get(url);
            if (!session) {
                throw new Error('Session not found for URL');
            }

            // Simulated console logs capture
            const sampleLogs: ConsoleLogs[] = [
                {
                    type: 'log',
                    message: 'Application initialized',
                    timestamp: new Date().toISOString(),
                    source: 'app.js'
                },
                {
                    type: 'info',
                    message: 'Fetching data from API',
                    timestamp: new Date().toISOString(),
                    source: 'api.js'
                }
            ];

            session.consoleLogs = sampleLogs;
            console.log(`Captured ${sampleLogs.length} console logs`);
            return sampleLogs;
            
        } catch (error) {
            console.error('Error capturing console logs:', error);
            throw error;
        }
    }

    async takeScreenshot(url: string): Promise<PageScreenshot> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Browser');
        }

        try {
            const session = this.sessions.get(url);
            if (!session) {
                throw new Error('Session not found for URL');
            }

            // Simulated screenshot (base64 placeholder)
            const screenshot: PageScreenshot = {
                url: url,
                screenshotBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
                timestamp: new Date().toISOString()
            };

            console.log(`Screenshot taken: ${url}`);
            return screenshot;
            
        } catch (error) {
            console.error('Error taking screenshot:', error);
            throw error;
        }
    }

    async captureNetworkRequests(url: string): Promise<NetworkRequest[]> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Browser');
        }

        try {
            const session = this.sessions.get(url);
            if (!session) {
                throw new Error('Session not found for URL');
            }

            // Simulated network requests
            const requests: NetworkRequest[] = [
                {
                    url: 'https://api.example.com/data',
                    method: 'GET',
                    status: 200,
                    size: 1024,
                    duration: 245,
                    type: 'fetch'
                },
                {
                    url: 'https://cdn.example.com/app.js',
                    method: 'GET',
                    status: 200,
                    size: 45678,
                    duration: 156,
                    type: 'script'
                }
            ];

            session.networkRequests = requests;
            console.log(`Captured ${requests.length} network requests`);
            return requests;
            
        } catch (error) {
            console.error('Error capturing network requests:', error);
            throw error;
        }
    }

    async getPageSource(url: string): Promise<string> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Browser');
        }

        try {
            const session = this.sessions.get(url);
            if (!session) {
                throw new Error('Session not found for URL');
            }

            const source = `<!DOCTYPE html>
<html>
<head>
    <title>${session.title}</title>
</head>
<body>
    <h1>Page from ${url}</h1>
    <p>Browser session active</p>
</body>
</html>`;

            session.pageSource = source;
            console.log(`Retrieved page source for: ${url}`);
            return source;
            
        } catch (error) {
            console.error('Error getting page source:', error);
            throw error;
        }
    }

    async inspectElement(url: string, selector: string): Promise<any> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Browser');
        }

        try {
            return {
                selector: selector,
                found: true,
                html: `<div>${selector}</div>`,
                attributes: {},
                computed: {
                    display: 'block',
                    color: 'rgb(0, 0, 0)',
                    fontSize: '16px'
                }
            };
            
        } catch (error) {
            console.error('Error inspecting element:', error);
            throw error;
        }
    }

    getSession(url: string): BrowserSession | undefined {
        return this.sessions.get(url);
    }

    getAllSessions(): BrowserSession[] {
        return Array.from(this.sessions.values());
    }

    closeSession(url: string): boolean {
        return this.sessions.delete(url);
    }
}
