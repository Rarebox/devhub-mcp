import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { McpServer, ServerStatus, DevHubState } from './types';
import { GitHubMcpServer } from './mcp-servers/github';
import { MongoDBMcpServer } from './mcp-servers/mongodb';
import { StripeMcpServer } from './mcp-servers/stripe';
import { LemonSqueezyMcpServer } from './mcp-servers/lemonsqueezy';
import { AuthMcpServer } from './mcp-servers/auth';
import { Context7McpServer } from './mcp-servers/context7';
import { SequentialThinkingMcpServer } from './mcp-servers/sequential-thinking';
import { FirecrawlMcpServer } from './mcp-servers/firecrawl';
import { FilesystemMcpServer } from './mcp-servers/filesystem';
import { BrowserMcpServer } from './mcp-servers/browser';
import { FigmaMcpServer } from './mcp-servers/figma';
import { SupabaseMcpServer } from './mcp-servers/supabase';
import { VercelMcpServer } from './mcp-servers/vercel';
import { SentryMcpServer } from './mcp-servers/sentry';

export class McpManager extends EventEmitter {
    private servers: Map<string, McpServer> = new Map();
    private activeConnections: Map<string, any> = new Map();
    private context: vscode.ExtensionContext;
    private state: DevHubState;
    private githubServer: GitHubMcpServer | null = null;
    private mongodbServer: MongoDBMcpServer | null = null;
    private stripeServer: StripeMcpServer | null = null;
    private lemonsqueezyServer: LemonSqueezyMcpServer | null = null;
    private authServer: AuthMcpServer | null = null;
    private context7Server: Context7McpServer | null = null;
    private sequentialThinkingServer: SequentialThinkingMcpServer | null = null;
    private firecrawlServer: FirecrawlMcpServer | null = null;
    private filesystemServer: FilesystemMcpServer | null = null;
    private browserServer: BrowserMcpServer | null = null;
    private figmaServer: FigmaMcpServer | null = null;
    private supabaseServer: SupabaseMcpServer | null = null;
    private vercelServer: VercelMcpServer | null = null;
    private sentryServer: SentryMcpServer | null = null;

    constructor(context: vscode.ExtensionContext) {
        super();
        this.context = context;
        this.state = this.loadState();
        this.initializeServers();
    }

    private loadState(): DevHubState {
        const savedState = this.context.globalState.get<DevHubState>('devhubState');
        return savedState || {
            servers: [],
            isConnecting: false
        };
    }

    private saveState(): void {
        try {
            this.context.globalState.update('devhubState', this.state);
        } catch (error) {
            console.error('Failed to save state:', error);
        }
    }

    private initializeServers(): void {
        try {
            this.state.servers.forEach(server => {
                this.servers.set(server.id, server);
            });
        } catch (error) {
            console.error('Failed to initialize servers:', error);
        }
    }

    public registerServer(server: McpServer): void {
        try {
            if (!server.id || !server.name) {
                throw new Error('Server must have id and name');
            }

            this.servers.set(server.id, server);
            this.state.servers = Array.from(this.servers.values());
            this.saveState();
            
            this.emit('serverRegistered', server);
            console.log(`Registered server: ${server.id}`);
        } catch (error) {
            console.error('Failed to register server:', error);
            throw error;
        }
    }

    public async connectServer(serverId: string): Promise<boolean> {
        try {
            const server = this.servers.get(serverId);
            if (!server) {
                console.error(`Server not found: ${serverId}`);
                return false;
            }

            console.log(`Connecting to ${server.name}...`);
            server.status = ServerStatus.Connecting;
            this.emit('serverStatusChanged', { serverId, status: ServerStatus.Connecting });

            // GitHub için gerçek connection
            if (server.type === 'github') {
                // Token al
                const token = await this.getGitHubToken();
                if (!token) {
                    server.status = ServerStatus.Disconnected;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Disconnected });
                    return false;
                }

                // GitHub server instance oluştur
                this.githubServer = new GitHubMcpServer();
                const connected = await this.githubServer.connect(token);

                if (connected) {
                    server.status = ServerStatus.Connected;
                    this.activeConnections.set(serverId, this.githubServer);
                    console.log(`Successfully connected to ${server.name}`);
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Connected });
                    return true;
                } else {
                    server.status = ServerStatus.Error;
                    this.githubServer = null;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Error });
                    return false;
                }
            }

            // MongoDB için gerçek connection
            if (server.type === 'mongodb') {
                // Connection string al
                const connectionString = await this.getMongoDBConnectionString();
                if (!connectionString) {
                    server.status = ServerStatus.Disconnected;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Disconnected });
                    return false;
                }

                // Optional: Database name
                const database = await vscode.window.showInputBox({
                    prompt: 'Enter default database name (optional)',
                    placeHolder: 'mydatabase',
                    ignoreFocusOut: true
                });

                // MongoDB server instance oluştur
                this.mongodbServer = new MongoDBMcpServer();
                const connected = await this.mongodbServer.connect(connectionString, database);

                if (connected) {
                    server.status = ServerStatus.Connected;
                    this.activeConnections.set(serverId, this.mongodbServer);
                    console.log(`Successfully connected to ${server.name}`);
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Connected });
                    return true;
                } else {
                    server.status = ServerStatus.Error;
                    this.mongodbServer = null;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Error });
                    return false;
                }
            }

            // Stripe için gerçek connection
            if (server.type === 'stripe') {
                const apiKey = await this.getStripeApiKey();
                if (!apiKey) {
                    server.status = ServerStatus.Disconnected;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Disconnected });
                    return false;
                }

                this.stripeServer = new StripeMcpServer();
                const connected = await this.stripeServer.connect(apiKey);

                if (connected) {
                    server.status = ServerStatus.Connected;
                    this.activeConnections.set(serverId, this.stripeServer);
                    console.log(`Successfully connected to ${server.name}`);
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Connected });
                    return true;
                } else {
                    server.status = ServerStatus.Error;
                    this.stripeServer = null;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Error });
                    return false;
                }
            }

            // LemonSqueezy için gerçek connection
            if (server.type === 'lemonsqueezy') {
                const apiKey = await this.getLemonSqueezyApiKey();
                if (!apiKey) {
                    server.status = ServerStatus.Disconnected;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Disconnected });
                    return false;
                }

                this.lemonsqueezyServer = new LemonSqueezyMcpServer();
                const connected = await this.lemonsqueezyServer.connect(apiKey);

                if (connected) {
                    server.status = ServerStatus.Connected;
                    this.activeConnections.set(serverId, this.lemonsqueezyServer);
                    console.log(`Successfully connected to ${server.name}`);
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Connected });
                    return true;
                } else {
                    server.status = ServerStatus.Error;
                    this.lemonsqueezyServer = null;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Error });
                    return false;
                }
            }

            // Auth için gerçek connection
            if (server.type === 'auth') {
                const apiKey = await this.getAuthApiKey();
                if (!apiKey) {
                    server.status = ServerStatus.Disconnected;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Disconnected });
                    return false;
                }

                this.authServer = new AuthMcpServer();
                const connected = await this.authServer.connect(apiKey);

                if (connected) {
                    server.status = ServerStatus.Connected;
                    this.activeConnections.set(serverId, this.authServer);
                    console.log(`Successfully connected to ${server.name}`);
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Connected });
                    return true;
                } else {
                    server.status = ServerStatus.Error;
                    this.authServer = null;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Error });
                    return false;
                }
            }

            // Context 7 için gerçek connection
            if (server.type === 'context7') {
                const apiKey = await this.getContext7ApiKey();
                if (!apiKey) {
                    server.status = ServerStatus.Disconnected;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Disconnected });
                    return false;
                }

                this.context7Server = new Context7McpServer();
                const connected = await this.context7Server.connect(apiKey);

                if (connected) {
                    server.status = ServerStatus.Connected;
                    this.activeConnections.set(serverId, this.context7Server);
                    console.log(`Successfully connected to ${server.name}`);
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Connected });
                    return true;
                } else {
                    server.status = ServerStatus.Error;
                    this.context7Server = null;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Error });
                    return false;
                }
            }

            // Sequential Thinking için gerçek connection
            if (server.type === 'sequential-thinking') {
                const apiKey = await this.getSequentialThinkingApiKey();
                if (!apiKey) {
                    server.status = ServerStatus.Disconnected;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Disconnected });
                    return false;
                }

                this.sequentialThinkingServer = new SequentialThinkingMcpServer();
                const connected = await this.sequentialThinkingServer.connect(apiKey);

                if (connected) {
                    server.status = ServerStatus.Connected;
                    this.activeConnections.set(serverId, this.sequentialThinkingServer);
                    console.log(`Successfully connected to ${server.name}`);
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Connected });
                    return true;
                } else {
                    server.status = ServerStatus.Error;
                    this.sequentialThinkingServer = null;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Error });
                    return false;
                }
            }

            // Firecrawl için gerçek connection
            if (server.type === 'firecrawl') {
                const apiKey = await this.getFirecrawlApiKey();
                if (!apiKey) {
                    server.status = ServerStatus.Disconnected;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Disconnected });
                    return false;
                }

                this.firecrawlServer = new FirecrawlMcpServer();
                const connected = await this.firecrawlServer.connect(apiKey);

                if (connected) {
                    server.status = ServerStatus.Connected;
                    this.activeConnections.set(serverId, this.firecrawlServer);
                    console.log(`Successfully connected to ${server.name}`);
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Connected });
                    return true;
                } else {
                    server.status = ServerStatus.Error;
                    this.firecrawlServer = null;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Error });
                    return false;
                }
            }

            // FileSystem için gerçek connection
            if (server.type === 'filesystem') {
                const rootPath = await this.getFilesystemRootPath();
                if (!rootPath) {
                    server.status = ServerStatus.Disconnected;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Disconnected });
                    return false;
                }

                this.filesystemServer = new FilesystemMcpServer({ rootPath });
                const connected = await this.filesystemServer.connect();

                if (connected) {
                    server.status = ServerStatus.Connected;
                    this.activeConnections.set(serverId, this.filesystemServer);
                    console.log(`Successfully connected to ${server.name}`);
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Connected });
                    return true;
                } else {
                    server.status = ServerStatus.Error;
                    this.filesystemServer = null;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Error });
                    return false;
                }
            }

            // Diğer servisler için simülasyon (şimdilik)
            await new Promise(resolve => setTimeout(resolve, 1000));
            server.status = ServerStatus.Connected;
            this.activeConnections.set(serverId, { type: server.type, connected: true });
            
            console.log(`Successfully connected to ${server.name}`);
            this.emit('serverStatusChanged', { serverId, status: ServerStatus.Connected });
            return true;

        } catch (error) {
            console.error(`Error connecting to server ${serverId}:`, error);
            const server = this.servers.get(serverId);
            if (server) {
                server.status = ServerStatus.Error;
                this.emit('serverStatusChanged', { serverId, status: ServerStatus.Error });
            }
            return false;
        }
    }

    public async disconnectServer(serverId: string): Promise<void> {
        try {
            const server = this.servers.get(serverId);
            if (!server) {
                console.error(`Server not found: ${serverId}`);
                return;
            }

            console.log(`Disconnecting from ${server.name}...`);

            // GitHub için gerçek disconnect
            if (server.type === 'github' && this.githubServer) {
                await this.githubServer.disconnect();
                this.githubServer = null;
            }

            // MongoDB için gerçek disconnect
            if (server.type === 'mongodb' && this.mongodbServer) {
                await this.mongodbServer.disconnect();
                this.mongodbServer = null;
            }

            // Stripe için gerçek disconnect
            if (server.type === 'stripe' && this.stripeServer) {
                await this.stripeServer.disconnect();
                this.stripeServer = null;
            }

            // LemonSqueezy için gerçek disconnect
            if (server.type === 'lemonsqueezy' && this.lemonsqueezyServer) {
                await this.lemonsqueezyServer.disconnect();
                this.lemonsqueezyServer = null;
            }

            // Auth için gerçek disconnect
            if (server.type === 'auth' && this.authServer) {
                await this.authServer.disconnect();
                this.authServer = null;
            }

            // Context 7 için gerçek disconnect
            if (server.type === 'context7' && this.context7Server) {
                await this.context7Server.disconnect();
                this.context7Server = null;
            }

            // Sequential Thinking için gerçek disconnect
            if (server.type === 'sequential-thinking' && this.sequentialThinkingServer) {
                await this.sequentialThinkingServer.disconnect();
                this.sequentialThinkingServer = null;
            }

            // Firecrawl için gerçek disconnect
            if (server.type === 'firecrawl' && this.firecrawlServer) {
                await this.firecrawlServer.disconnect();
                this.firecrawlServer = null;
            }

            // FileSystem için gerçek disconnect
            if (server.type === 'filesystem' && this.filesystemServer) {
                await this.filesystemServer.disconnect();
                this.filesystemServer = null;
            }

            server.status = ServerStatus.Disconnected;
            this.activeConnections.delete(serverId);
            
            console.log(`Disconnected from ${server.name}`);
            this.emit('serverStatusChanged', { serverId, status: ServerStatus.Disconnected });
            
        } catch (error) {
            console.error(`Error disconnecting from server ${serverId}:`, error);
        }
    }

    public getServerStatus(serverId: string): ServerStatus {
        try {
            const server = this.servers.get(serverId);
            return server ? server.status : ServerStatus.Disconnected;
        } catch (error) {
            console.error(`Failed to get server status for ${serverId}:`, error);
            return ServerStatus.Disconnected;
        }
    }

    public getAllServers(): McpServer[] {
        try {
            return Array.from(this.servers.values()).sort((a, b) => 
                a.name.localeCompare(b.name)
            );
        } catch (error) {
            console.error('Failed to get all servers:', error);
            return [];
        }
    }

    public getServerById(serverId: string): McpServer | undefined {
        try {
            return this.servers.get(serverId);
        } catch (error) {
            console.error(`Failed to get server by id ${serverId}:`, error);
            return undefined;
        }
    }

    public updateServerConfig(serverId: string, config: Record<string, any>): boolean {
        try {
            const server = this.servers.get(serverId);
            if (!server) {
                throw new Error(`Server with id ${serverId} not found`);
            }

            server.config = { ...server.config, ...config };
            this.servers.set(serverId, server);
            this.state.servers = Array.from(this.servers.values());
            this.saveState();

            this.emit('serverConfigUpdated', server);
            console.log(`Updated config for server: ${serverId}`);
            
            return true;
        } catch (error) {
            console.error(`Failed to update config for server ${serverId}:`, error);
            return false;
        }
    }

    public getState(): DevHubState {
        return { ...this.state };
    }

    public updateState(newState: Partial<DevHubState>): void {
        try {
            this.state = { ...this.state, ...newState };
            this.saveState();
        } catch (error) {
            console.error('Failed to update state:', error);
        }
    }

    public getActiveConnections(): Map<string, any> {
        return new Map(this.activeConnections);
    }

    public dispose(): void {
        try {
            // Disconnect all active connections
            const disconnectPromises = Array.from(this.activeConnections.keys()).map(
                serverId => this.disconnectServer(serverId)
            );
            
            Promise.all(disconnectPromises).catch(error => {
                console.error('Error during disposal:', error);
            });

            // Clear all maps
            this.servers.clear();
            this.activeConnections.clear();
            
            // Remove all event listeners
            this.removeAllListeners();
            
            console.log('McpManager disposed successfully');
        } catch (error) {
            console.error('Error during McpManager disposal:', error);
        }
    }

    private async getGitHubToken(): Promise<string | undefined> {
        const token = await vscode.window.showInputBox({
            prompt: 'Enter your GitHub Personal Access Token',
            password: true,
            placeHolder: 'ghp_xxxxxxxxxxxxxxxxxxxx',
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value) {
                    return 'Token is required';
                }
                if (!value.startsWith('ghp_') && !value.startsWith('github_pat_')) {
                    return 'Invalid token format. Should start with ghp_ or github_pat_';
                }
                return null;
            }
        });
        
        return token;
    }

    private async getMongoDBConnectionString(): Promise<string | undefined> {
        const connectionString = await vscode.window.showInputBox({
            prompt: 'Enter MongoDB connection string',
            placeHolder: 'mongodb://localhost:27017',
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value) {
                    return 'Connection string is required';
                }
                if (!value.startsWith('mongodb://') && !value.startsWith('mongodb+srv://')) {
                    return 'Invalid format. Should start with mongodb:// or mongodb+srv://';
                }
                return null;
            }
        });
        
        return connectionString;
    }

    private async getStripeApiKey(): Promise<string | undefined> {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your Stripe API Key (Secret Key)',
            password: true,
            placeHolder: 'sk_test_... or sk_live_...',
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value) {
                    return 'API key is required';
                }
                if (!value.startsWith('sk_')) {
                    return 'Invalid format. Should start with sk_';
                }
                return null;
            }
        });
        return apiKey;
    }

    private async getLemonSqueezyApiKey(): Promise<string | undefined> {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your LemonSqueezy API Key',
            password: true,
            placeHolder: 'your-lemonsqueezy-api-key',
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value) {
                    return 'API key is required';
                }
                if (value.length < 10) {
                    return 'API key too short';
                }
                return null;
            }
        });
        return apiKey;
    }

    private async getAuthApiKey(): Promise<string | undefined> {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your Auth API Key',
            password: true,
            placeHolder: 'your-auth-api-key',
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value) {
                    return 'API key is required';
                }
                if (value.length < 10) {
                    return 'API key too short';
                }
                return null;
            }
        });
        return apiKey;
    }

    private async getContext7ApiKey(): Promise<string | undefined> {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your Context 7 API Key',
            password: true,
            placeHolder: 'ctx7_...',
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value) return 'API key is required';
                if (!value.startsWith('ctx7_')) return 'Invalid format. Should start with ctx7_';
                return null;
            }
        });
        return apiKey;
    }

    public getGitHubServer(): GitHubMcpServer | null {
        return this.githubServer;
    }

    public getMongoDBServer(): MongoDBMcpServer | null {
        return this.mongodbServer;
    }

    getStripeServer(): StripeMcpServer | null {
        return this.stripeServer;
    }

    getLemonSqueezyServer(): LemonSqueezyMcpServer | null {
        return this.lemonsqueezyServer;
    }

    getAuthServer(): AuthMcpServer | null {
        return this.authServer;
    }

    getContext7Server(): Context7McpServer | null {
        return this.context7Server;
    }

    private async getSequentialThinkingApiKey(): Promise<string | undefined> {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your Sequential Thinking API Key or any key',
            password: true,
            placeHolder: 'st_... or any-key-for-reasoning',
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value) return 'API key is required';
                if (value.length < 10) return 'Key must be at least 10 characters';
                return null;
            }
        });
        return apiKey;
    }

    getSequentialThinkingServer(): SequentialThinkingMcpServer | null {
        return this.sequentialThinkingServer;
    }

    private async getFirecrawlApiKey(): Promise<string | undefined> {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your Firecrawl API Key',
            password: true,
            placeHolder: 'fc_... (Get from firecrawl.dev)',
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value) return 'API key is required';
                if (!value.startsWith('fc_')) return 'Invalid format. Should start with fc_';
                return null;
            }
        });
        return apiKey;
    }

    getFirecrawlServer(): FirecrawlMcpServer | null {
        return this.firecrawlServer;
    }

    private async getFilesystemRootPath(): Promise<string | undefined> {
        const rootPath = await vscode.window.showInputBox({
            prompt: 'Enter root path for file system access',
            placeHolder: process.cwd(),
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value) return 'Root path is required';
                return null;
            }
        });
        return rootPath;
    }

    getFilesystemServer(): FilesystemMcpServer | null {
        return this.filesystemServer;
    }
}
