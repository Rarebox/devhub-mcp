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
import { TaskmasterMcpServer } from './mcp-servers/taskmaster';
import { DesktopCommanderMcpServer } from './mcp-servers/desktop-commander';
import { Dev21McpServer } from './mcp-servers/21st-dev';

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
    private taskmasterServer: TaskmasterMcpServer | null = null;
    private desktopCommanderServer: DesktopCommanderMcpServer | null = null;
    private dev21Server: Dev21McpServer | null = null;

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
                    console.log(`Emitting serverStatusChanged event for ${serverId} with status ${ServerStatus.Connected}`);
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

            // Browser için gerçek connection
            if (server.type === 'browser') {
                const apiKey = await this.getBrowserApiKey();
                if (!apiKey) {
                    server.status = ServerStatus.Disconnected;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Disconnected });
                    return false;
                }

                this.browserServer = new BrowserMcpServer();
                const connected = await this.browserServer.connect(apiKey);

                if (connected) {
                    server.status = ServerStatus.Connected;
                    this.activeConnections.set(serverId, this.browserServer);
                    console.log(`Successfully connected to ${server.name}`);
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Connected });
                    return true;
                } else {
                    server.status = ServerStatus.Error;
                    this.browserServer = null;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Error });
                    return false;
                }
            }

            // Figma için gerçek connection
            if (server.type === 'figma') {
                const apiKey = await this.getFigmaApiKey();
                if (!apiKey) {
                    server.status = ServerStatus.Disconnected;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Disconnected });
                    return false;
                }

                this.figmaServer = new FigmaMcpServer();
                const connected = await this.figmaServer.connect(apiKey);

                if (connected) {
                    server.status = ServerStatus.Connected;
                    this.activeConnections.set(serverId, this.figmaServer);
                    console.log(`Successfully connected to ${server.name}`);
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Connected });
                    return true;
                } else {
                    server.status = ServerStatus.Error;
                    this.figmaServer = null;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Error });
                    return false;
                }
            }

            // Supabase için gerçek connection
            if (server.type === 'supabase') {
                const apiKey = await this.getSupabaseApiKey();
                if (!apiKey) {
                    server.status = ServerStatus.Disconnected;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Disconnected });
                    return false;
                }

                const projectUrl = await vscode.window.showInputBox({
                    prompt: 'Enter your Supabase Project URL',
                    placeHolder: 'https://your-project.supabase.co',
                    ignoreFocusOut: true,
                    validateInput: (value) => {
                        if (!value) {
                            return 'Project URL is required';
                        }
                        if (!value.startsWith('https://') || !value.includes('.supabase.co')) {
                            return 'Invalid format. Should be https://your-project.supabase.co';
                        }
                        return null;
                    }
                });

                if (!projectUrl) {
                    server.status = ServerStatus.Disconnected;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Disconnected });
                    return false;
                }

                this.supabaseServer = new SupabaseMcpServer();
                const connected = await this.supabaseServer.connect(apiKey, projectUrl);

                if (connected) {
                    server.status = ServerStatus.Connected;
                    this.activeConnections.set(serverId, this.supabaseServer);
                    console.log(`Successfully connected to ${server.name}`);
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Connected });
                    return true;
                } else {
                    server.status = ServerStatus.Error;
                    this.supabaseServer = null;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Error });
                    return false;
                }
            }

            // Vercel için gerçek connection
            if (server.type === 'vercel') {
                const apiKey = await this.getVercelApiKey();
                if (!apiKey) {
                    server.status = ServerStatus.Disconnected;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Disconnected });
                    return false;
                }

                this.vercelServer = new VercelMcpServer();
                const connected = await this.vercelServer.connect(apiKey);

                if (connected) {
                    server.status = ServerStatus.Connected;
                    this.activeConnections.set(serverId, this.vercelServer);
                    console.log(`Successfully connected to ${server.name}`);
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Connected });
                    return true;
                } else {
                    server.status = ServerStatus.Error;
                    this.vercelServer = null;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Error });
                    return false;
                }
            }

            // Sentry için gerçek connection
            if (server.type === 'sentry') {
                const apiKey = await this.getSentryApiKey();
                if (!apiKey) {
                    server.status = ServerStatus.Disconnected;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Disconnected });
                    return false;
                }

                const organizationSlug = await vscode.window.showInputBox({
                    prompt: 'Enter your Sentry Organization Slug',
                    placeHolder: 'your-organization',
                    ignoreFocusOut: true,
                    validateInput: (value) => {
                        if (!value) {
                            return 'Organization slug is required';
                        }
                        if (value.length < 2) {
                            return 'Organization slug too short';
                        }
                        return null;
                    }
                });

                if (!organizationSlug) {
                    server.status = ServerStatus.Disconnected;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Disconnected });
                    return false;
                }

                this.sentryServer = new SentryMcpServer();
                const connected = await this.sentryServer.connect(apiKey, organizationSlug);

                if (connected) {
                    server.status = ServerStatus.Connected;
                    this.activeConnections.set(serverId, this.sentryServer);
                    console.log(`Successfully connected to ${server.name}`);
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Connected });
                    return true;
                } else {
                    server.status = ServerStatus.Error;
                    this.sentryServer = null;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Error });
                    return false;
                }
            }

            // Taskmaster için gerçek connection
            if (server.type === 'taskmaster') {
                const apiKey = await this.getTaskmasterApiKey();
                if (!apiKey) {
                    server.status = ServerStatus.Disconnected;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Disconnected });
                    return false;
                }

                this.taskmasterServer = new TaskmasterMcpServer();
                const connected = await this.taskmasterServer.connect(apiKey);

                if (connected) {
                    server.status = ServerStatus.Connected;
                    this.activeConnections.set(serverId, this.taskmasterServer);
                    console.log(`Successfully connected to ${server.name}`);
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Connected });
                    return true;
                } else {
                    server.status = ServerStatus.Error;
                    this.taskmasterServer = null;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Error });
                    return false;
                }
            }

            // Desktop Commander için gerçek connection
            if (server.type === 'desktop-commander') {
                const apiKey = await this.getDesktopCommanderApiKey();
                if (!apiKey) {
                    server.status = ServerStatus.Disconnected;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Disconnected });
                    return false;
                }

                this.desktopCommanderServer = new DesktopCommanderMcpServer();
                const connected = await this.desktopCommanderServer.connect(apiKey);

                if (connected) {
                    server.status = ServerStatus.Connected;
                    this.activeConnections.set(serverId, this.desktopCommanderServer);
                    console.log(`Successfully connected to ${server.name}`);
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Connected });
                    return true;
                } else {
                    server.status = ServerStatus.Error;
                    this.desktopCommanderServer = null;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Error });
                    return false;
                }
            }

            // 21st Dev için gerçek connection
            if (server.type === '21st-dev') {
                const apiKey = await this.get21stDevApiKey();
                if (!apiKey) {
                    server.status = ServerStatus.Disconnected;
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Disconnected });
                    return false;
                }

                this.dev21Server = new Dev21McpServer();
                const connected = await this.dev21Server.connect(apiKey);

                if (connected) {
                    server.status = ServerStatus.Connected;
                    this.activeConnections.set(serverId, this.dev21Server);
                    console.log(`Successfully connected to ${server.name}`);
                    this.emit('serverStatusChanged', { serverId, status: ServerStatus.Connected });
                    return true;
                } else {
                    server.status = ServerStatus.Error;
                    this.dev21Server = null;
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

            // Browser için gerçek disconnect
            if (server.type === 'browser' && this.browserServer) {
                await this.browserServer.disconnect();
                this.browserServer = null;
            }

            // Figma için gerçek disconnect
            if (server.type === 'figma' && this.figmaServer) {
                await this.figmaServer.disconnect();
                this.figmaServer = null;
            }

            // Supabase için gerçek disconnect
            if (server.type === 'supabase' && this.supabaseServer) {
                await this.supabaseServer.disconnect();
                this.supabaseServer = null;
            }

            // Vercel için gerçek disconnect
            if (server.type === 'vercel' && this.vercelServer) {
                await this.vercelServer.disconnect();
                this.vercelServer = null;
            }

            // Sentry için gerçek disconnect
            if (server.type === 'sentry' && this.sentryServer) {
                await this.sentryServer.disconnect();
                this.sentryServer = null;
            }

            // Taskmaster için gerçek disconnect
            if (server.type === 'taskmaster' && this.taskmasterServer) {
                await this.taskmasterServer.disconnect();
                this.taskmasterServer = null;
            }

            // Desktop Commander için gerçek disconnect
            if (server.type === 'desktop-commander' && this.desktopCommanderServer) {
                await this.desktopCommanderServer.disconnect();
                this.desktopCommanderServer = null;
            }

            // 21st Dev için gerçek disconnect
            if (server.type === '21st-dev' && this.dev21Server) {
                await this.dev21Server.disconnect();
                this.dev21Server = null;
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
                if (!value) {
                    return 'API key is required';
                }
                if (!value.startsWith('st_')) {
                    return 'Invalid format. Should start with st_';
                }
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
                if (!value) {
                    return 'API key is required';
                }
                if (value.length < 10) {
                    return 'Key must be at least 10 characters';
                }
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
                if (!value) {
                    return 'API key is required';
                }
                if (!value.startsWith('fc_')) {
                    return 'Invalid format. Should start with fc_';
                }
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
                if (!value) {
                    return 'Root path is required';
                }
                return null;
            }
        });
        return rootPath;
    }

    getFilesystemServer(): FilesystemMcpServer | null {
        return this.filesystemServer;
    }

    private async getBrowserApiKey(): Promise<string | undefined> {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your Browser API Key',
            password: true,
            placeHolder: 'browser_... or any-key-for-browser-automation',
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value) {
                    return 'API key is required';
                }
                if (value.length < 10) {
                    return 'API key must be at least 10 characters';
                }
                return null;
            }
        });
        return apiKey;
    }

    getBrowserServer(): BrowserMcpServer | null {
        return this.browserServer;
    }

    private async getFigmaApiKey(): Promise<string | undefined> {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your Figma API Key',
            password: true,
            placeHolder: 'figd_... (Get from figma.com/developers/api)',
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value) {
                    return 'API key is required';
                }
                if (!value.startsWith('figd_')) {
                    return 'Invalid format. Should start with figd_';
                }
                return null;
            }
        });
        return apiKey;
    }

    getFigmaServer(): FigmaMcpServer | null {
        return this.figmaServer;
    }

    private async getSupabaseApiKey(): Promise<string | undefined> {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your Supabase API Key',
            password: true,
            placeHolder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value) {
                    return 'API key is required';
                }
                if (value.length < 20) {
                    return 'API key too short';
                }
                return null;
            }
        });
        return apiKey;
    }

    getSupabaseServer(): SupabaseMcpServer | null {
        return this.supabaseServer;
    }

    private async getVercelApiKey(): Promise<string | undefined> {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your Vercel API Key',
            password: true,
            placeHolder: 'VERCEL_TOKEN_... (Get from vercel.com/account/tokens)',
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value) {
                    return 'API key is required';
                }
                if (!value.startsWith('VERCEL_TOKEN_')) {
                    return 'Invalid format. Should start with VERCEL_TOKEN_';
                }
                return null;
            }
        });
        return apiKey;
    }

    getVercelServer(): VercelMcpServer | null {
        return this.vercelServer;
    }

    private async getSentryApiKey(): Promise<string | undefined> {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your Sentry API Key',
            password: true,
            placeHolder: 'https://...@sentry.io/...',
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value) {
                    return 'API key is required';
                }
                if (!value.includes('sentry.io')) {
                    return 'Invalid format. Should contain sentry.io';
                }
                return null;
            }
        });
        return apiKey;
    }

    getSentryServer(): SentryMcpServer | null {
        return this.sentryServer;
    }

    private async getTaskmasterApiKey(): Promise<string | undefined> {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your Taskmaster API Key',
            password: true,
            placeHolder: 'tm_... or any-key-for-task-management',
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value) {
                    return 'API key is required';
                }
                if (value.length < 10) {
                    return 'API key must be at least 10 characters';
                }
                return null;
            }
        });
        return apiKey;
    }

    getTaskmasterServer(): TaskmasterMcpServer | null {
        return this.taskmasterServer;
    }

    private async getDesktopCommanderApiKey(): Promise<string | undefined> {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your Desktop Commander API Key',
            password: true,
            placeHolder: 'dc_... or any-key-for-desktop-control',
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value) {
                    return 'API key is required';
                }
                if (value.length < 10) {
                    return 'API key must be at least 10 characters';
                }
                return null;
            }
        });
        return apiKey;
    }

    getDesktopCommanderServer(): DesktopCommanderMcpServer | null {
        return this.desktopCommanderServer;
    }

    private async get21stDevApiKey(): Promise<string | undefined> {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your 21st Dev API Key',
            password: true,
            placeHolder: '21st_... or any-key-for-code-generation',
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value) {
                    return 'API key is required';
                }
                if (value.length < 10) {
                    return 'API key must be at least 10 characters';
                }
                return null;
            }
        });
        return apiKey;
    }

    get21stDevServer(): Dev21McpServer | null {
        return this.dev21Server;
    }
}
