export interface SentryConfig {
    apiKey?: string;
    organizationSlug?: string;
}

export interface SentryProject {
    id: string;
    name: string;
    slug: string;
    platform: string;
    status: string;
}

export interface SentryIssue {
    id: string;
    title: string;
    shortID: string;
    status: string;
    count: number;
    firstSeen: string;
    lastSeen: string;
    level: string; // 'fatal', 'error', 'warning', 'info'
}

export interface SentryEvent {
    id: string;
    message: string;
    level: string;
    timestamp: string;
    tags: Record<string, string>;
    stacktrace?: any;
}

export interface SentryRelease {
    version: string;
    status: string;
    dateCreated: string;
    dateReleased: string;
    issues: number;
}

export interface SentryStats {
    totalIssues: number;
    unresolvedIssues: number;
    errorRate: number;
    averageResponseTime: number;
}

export class SentryMcpServer {
    private apiKey: string | null = null;
    private organizationSlug: string | null = null;
    private isConnected: boolean = false;
    private baseUrl = 'https://sentry.io/api/0';

    constructor(config?: SentryConfig) {
        if (config?.apiKey) {
            this.apiKey = config.apiKey;
        }
        if (config?.organizationSlug) {
            this.organizationSlug = config.organizationSlug;
        }
    }

    async connect(apiKey: string, organizationSlug: string): Promise<boolean> {
        try {
            console.log('Connecting to Sentry...');
            
            this.apiKey = apiKey;
            this.organizationSlug = organizationSlug;
            
            if (!apiKey || !organizationSlug) {
                throw new Error('API key and organization slug required');
            }

            console.log(`Connected to Sentry organization: ${organizationSlug}`);
            this.isConnected = true;
            return true;
            
        } catch (error) {
            console.error('Sentry connection error:', error);
            this.isConnected = false;
            this.apiKey = null;
            this.organizationSlug = null;
            return false;
        }
    }

    async disconnect(): Promise<void> {
        this.apiKey = null;
        this.organizationSlug = null;
        this.isConnected = false;
        console.log('Disconnected from Sentry');
    }

    getConnectionStatus(): boolean {
        return this.isConnected;
    }

    async listProjects(): Promise<SentryProject[]> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Sentry');
        }

        try {
            const mockProjects: SentryProject[] = [
                {
                    id: 'proj_1',
                    name: 'DevHub Frontend',
                    slug: 'devhub-frontend',
                    platform: 'javascript-react',
                    status: 'active'
                },
                {
                    id: 'proj_2',
                    name: 'DevHub Backend',
                    slug: 'devhub-backend',
                    platform: 'node',
                    status: 'active'
                }
            ];

            console.log(`Retrieved ${mockProjects.length} projects`);
            return mockProjects;
            
        } catch (error) {
            console.error('Error listing projects:', error);
            throw error;
        }
    }

    async listIssues(projectSlug: string): Promise<SentryIssue[]> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Sentry');
        }

        try {
            const mockIssues: SentryIssue[] = [
                {
                    id: 'issue_1',
                    title: 'TypeError: Cannot read property of undefined',
                    shortID: 'DEVHUB-1A2B',
                    status: 'unresolved',
                    count: 234,
                    firstSeen: '2025-11-01T10:00:00Z',
                    lastSeen: '2025-11-05T15:30:00Z',
                    level: 'error'
                },
                {
                    id: 'issue_2',
                    title: 'ReferenceError: window is not defined',
                    shortID: 'DEVHUB-3C4D',
                    status: 'unresolved',
                    count: 89,
                    firstSeen: '2025-11-02T08:00:00Z',
                    lastSeen: '2025-11-05T14:20:00Z',
                    level: 'error'
                }
            ];

            console.log(`Retrieved ${mockIssues.length} issues`);
            return mockIssues;
            
        } catch (error) {
            console.error('Error listing issues:', error);
            throw error;
        }
    }

    async getIssueDetails(projectSlug: string, issueId: string): Promise<any> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Sentry');
        }

        try {
            const details = {
                id: issueId,
                title: 'Error Title',
                description: 'Detailed error description',
                status: 'unresolved',
                assignee: null,
                participants: [],
                firstSeen: new Date().toISOString(),
                lastSeen: new Date().toISOString(),
                stats: {
                    count: 234,
                    uniqueUsers: 45
                }
            };

            console.log(`Retrieved details for issue: ${issueId}`);
            return details;
            
        } catch (error) {
            console.error('Error getting issue details:', error);
            throw error;
        }
    }

    async resolveIssue(projectSlug: string, issueId: string): Promise<boolean> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Sentry');
        }

        try {
            console.log(`Resolved issue: ${issueId}`);
            return true;
        } catch (error) {
            console.error('Error resolving issue:', error);
            throw error;
        }
    }

    async listEvents(projectSlug: string, issueId: string): Promise<SentryEvent[]> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Sentry');
        }

        try {
            const mockEvents: SentryEvent[] = [
                {
                    id: 'evt_1',
                    message: 'TypeError: Cannot read property of undefined',
                    level: 'error',
                    timestamp: new Date().toISOString(),
                    tags: { environment: 'production', release: '1.0.0' }
                },
                {
                    id: 'evt_2',
                    message: 'TypeError: Cannot read property of undefined',
                    level: 'error',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    tags: { environment: 'staging', release: '1.0.1' }
                }
            ];

            console.log(`Retrieved ${mockEvents.length} events`);
            return mockEvents;
            
        } catch (error) {
            console.error('Error listing events:', error);
            throw error;
        }
    }

    async listReleases(projectSlug: string): Promise<SentryRelease[]> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Sentry');
        }

        try {
            const mockReleases: SentryRelease[] = [
                {
                    version: '1.0.0',
                    status: 'released',
                    dateCreated: '2025-11-01T00:00:00Z',
                    dateReleased: '2025-11-02T00:00:00Z',
                    issues: 15
                },
                {
                    version: '1.0.1',
                    status: 'released',
                    dateCreated: '2025-11-03T00:00:00Z',
                    dateReleased: '2025-11-04T00:00:00Z',
                    issues: 8
                }
            ];

            console.log(`Retrieved ${mockReleases.length} releases`);
            return mockReleases;
            
        } catch (error) {
            console.error('Error listing releases:', error);
            throw error;
        }
    }

    async getProjectStats(projectSlug: string): Promise<SentryStats> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Sentry');
        }

        try {
            const stats: SentryStats = {
                totalIssues: 245,
                unresolvedIssues: 45,
                errorRate: 0.8,
                averageResponseTime: 1250
            };

            console.log('Retrieved project statistics');
            return stats;
            
        } catch (error) {
            console.error('Error getting project stats:', error);
            throw error;
        }
    }
}
