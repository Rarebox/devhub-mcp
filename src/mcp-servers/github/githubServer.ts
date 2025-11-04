import { Octokit } from '@octokit/rest';

export interface GitHubConfig {
    token?: string;
    owner?: string;
    repo?: string;
}

export interface GitHubRepository {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    description: string | null;
    url: string;
    stars: number;
    forks: number;
    open_issues: number;
}

export interface GitHubPullRequest {
    id: number;
    number: number;
    title: string;
    state: string;
    created_at: string;
    updated_at: string;
    user: {
        login: string;
        avatar_url: string;
    };
    html_url: string;
}

export class GitHubMcpServer {
    private octokit: Octokit | null = null;
    private config: GitHubConfig = {};
    private isConnected: boolean = false;

    constructor(config?: GitHubConfig) {
        if (config) {
            this.config = config;
        }
    }

    async connect(token: string): Promise<boolean> {
        try {
            console.log('Connecting to GitHub with token...');
            
            this.octokit = new Octokit({
                auth: token
            });

            // Test connection by fetching user
            const { data } = await this.octokit.users.getAuthenticated();
            console.log(`Connected to GitHub as: ${data.login}`);
            
            this.config.token = token;
            this.isConnected = true;
            return true;
            
        } catch (error) {
            console.error('GitHub connection error:', error);
            this.isConnected = false;
            this.octokit = null;
            return false;
        }
    }

    async disconnect(): Promise<void> {
        this.octokit = null;
        this.config.token = undefined;
        this.isConnected = false;
        console.log('Disconnected from GitHub');
    }

    getConnectionStatus(): boolean {
        return this.isConnected;
    }

    async listRepositories(): Promise<GitHubRepository[]> {
        if (!this.octokit || !this.isConnected) {
            throw new Error('Not connected to GitHub');
        }

        try {
            const { data } = await this.octokit.repos.listForAuthenticatedUser({
                sort: 'updated',
                per_page: 30
            });

            return data.map((repo: any) => ({
                id: repo.id,
                name: repo.name,
                full_name: repo.full_name,
                private: repo.private,
                description: repo.description,
                url: repo.html_url,
                stars: repo.stargazers_count || 0,
                forks: repo.forks_count || 0,
                open_issues: repo.open_issues_count || 0
            }));
            
        } catch (error) {
            console.error('Error listing repositories:', error);
            throw error;
        }
    }

    async listPullRequests(owner: string, repo: string): Promise<GitHubPullRequest[]> {
        if (!this.octokit || !this.isConnected) {
            throw new Error('Not connected to GitHub');
        }

        try {
            const { data } = await this.octokit.pulls.list({
                owner,
                repo,
                state: 'open',
                per_page: 30
            });

            return data.map((pr: any) => ({
                id: pr.id,
                number: pr.number,
                title: pr.title,
                state: pr.state,
                created_at: pr.created_at,
                updated_at: pr.updated_at,
                user: {
                    login: pr.user?.login || 'unknown',
                    avatar_url: pr.user?.avatar_url || ''
                },
                html_url: pr.html_url
            }));
            
        } catch (error) {
            console.error('Error listing pull requests:', error);
            throw error;
        }
    }

    async getRepository(owner: string, repo: string): Promise<GitHubRepository | null> {
        if (!this.octokit || !this.isConnected) {
            throw new Error('Not connected to GitHub');
        }

        try {
            const { data } = await this.octokit.repos.get({
                owner,
                repo
            });

            return {
                id: data.id,
                name: data.name,
                full_name: data.full_name,
                private: data.private,
                description: data.description,
                url: data.html_url,
                stars: data.stargazers_count || 0,
                forks: data.forks_count || 0,
                open_issues: data.open_issues_count || 0
            };
            
        } catch (error) {
            console.error('Error getting repository:', error);
            return null;
        }
    }

    getConfig(): GitHubConfig {
        return { ...this.config };
    }
}
