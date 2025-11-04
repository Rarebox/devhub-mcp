import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { McpServer, ServerStatus, DevHubState } from './types';
import { GitHubMcpServer } from './mcp-servers/github';

export class McpManager extends EventEmitter {
    private servers: Map<string, McpServer> = new Map();
    private activeConnections: Map<string, any> = new Map();
    private context: vscode.ExtensionContext;
    private state: DevHubState;
    private githubServer: GitHubMcpServer | null = null;

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

    public getGitHubServer(): GitHubMcpServer | null {
        return this.githubServer;
    }
}
