import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { McpServer, ServerStatus, DevHubState } from './types';

export class McpManager extends EventEmitter {
    private servers: Map<string, McpServer> = new Map();
    private activeConnections: Map<string, any> = new Map();
    private context: vscode.ExtensionContext;
    private state: DevHubState;

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
                throw new Error(`Server with id ${serverId} not found`);
            }

            if (server.status === ServerStatus.Connected) {
                console.log(`Server ${serverId} is already connected`);
                return true;
            }

            // Update status to connecting
            server.status = ServerStatus.Connected; // For now, directly set to connected
            server.lastConnected = new Date();
            server.error = undefined;

            // Simulate connection process
            console.log(`Connecting to server: ${serverId}...`);
            
            // Simulate async connection (in real implementation, this would be actual connection logic)
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Store active connection (placeholder for actual connection object)
            this.activeConnections.set(serverId, {
                connected: true,
                connectedAt: new Date()
            });

            // Update state
            this.servers.set(serverId, server);
            this.state.servers = Array.from(this.servers.values());
            this.saveState();

            this.emit('serverStatusChanged', server);
            console.log(`Successfully connected to server: ${serverId}`);
            
            return true;
        } catch (error) {
            console.error(`Failed to connect to server ${serverId}:`, error);
            
            // Update server status to error
            const server = this.servers.get(serverId);
            if (server) {
                server.status = ServerStatus.Error;
                server.error = error instanceof Error ? error.message : 'Unknown error';
                this.servers.set(serverId, server);
                this.state.servers = Array.from(this.servers.values());
                this.saveState();
                this.emit('serverStatusChanged', server);
            }
            
            return false;
        }
    }

    public async disconnectServer(serverId: string): Promise<void> {
        try {
            const server = this.servers.get(serverId);
            if (!server) {
                throw new Error(`Server with id ${serverId} not found`);
            }

            if (server.status === ServerStatus.Disconnected) {
                console.log(`Server ${serverId} is already disconnected`);
                return;
            }

            console.log(`Disconnecting from server: ${serverId}...`);

            // Close active connection
            const connection = this.activeConnections.get(serverId);
            if (connection) {
                // In real implementation, this would close the actual connection
                this.activeConnections.delete(serverId);
            }

            // Update server status
            server.status = ServerStatus.Disconnected;
            server.error = undefined;

            // Update state
            this.servers.set(serverId, server);
            this.state.servers = Array.from(this.servers.values());
            this.saveState();

            this.emit('serverStatusChanged', server);
            console.log(`Successfully disconnected from server: ${serverId}`);
        } catch (error) {
            console.error(`Failed to disconnect from server ${serverId}:`, error);
            throw error;
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
}
