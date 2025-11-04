import * as vscode from 'vscode';
import { McpManager } from './mcpManager';
import { McpServer, ServerStatus } from './types';

export class DevHubTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
    public readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | void> = this._onDidChangeTreeData.event;
    private mcpManager: McpManager;

    constructor(mcpManager: McpManager) {
        this.mcpManager = mcpManager;
        this.mcpManager.on('serverStatusChanged', () => this.refresh());
        this.mcpManager.on('serverRegistered', () => this.refresh());
        this.mcpManager.on('serverConfigUpdated', () => this.refresh());
    }

    public refresh(): void {
        this._onDidChangeTreeData.fire();
        console.log('TreeView refreshed');
    }

    public getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    public async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
        
        // Root level (no element) - Show all servers
        if (!element) {
            const servers = this.mcpManager.getAllServers();
            return servers.map(server => {
                const treeItem = new vscode.TreeItem(
                    server.name,
                    vscode.TreeItemCollapsibleState.Collapsed
                );
                
                // Set icon based on status
                if (server.status === ServerStatus.Connected) {
                    treeItem.iconPath = new vscode.ThemeIcon(
                        'check',
                        new vscode.ThemeColor('testing.iconPassed')
                    );
                } else if (server.status === ServerStatus.Error) {
                    treeItem.iconPath = new vscode.ThemeIcon(
                        'warning',
                        new vscode.ThemeColor('editorWarning.foreground')
                    );
                } else {
                    treeItem.iconPath = new vscode.ThemeIcon(
                        'circle-outline',
                        new vscode.ThemeColor('testing.iconFailed')
                    );
                }
                
                // Set context value for context menu
                treeItem.contextValue = 'mcpServer';
                
                // Set tooltip
                treeItem.tooltip = `${server.name}\nStatus: ${server.status}\nType: ${server.type}`;
                
                // Store server ID in description for later retrieval
                treeItem.description = server.id;
                
                return treeItem;
            });
        }
        
        // Child level - Show server details
        if (element && element.contextValue === 'mcpServer') {
            const serverId = element.description as string;
            const server = this.mcpManager.getServerById(serverId);
            
            if (!server) {
                return [];
            }
            
            const children: vscode.TreeItem[] = [];
            
            // Status item
            const statusItem = new vscode.TreeItem(
                `Status: ${server.status}`,
                vscode.TreeItemCollapsibleState.None
            );
            statusItem.contextValue = 'serverStatus';
            
            // Status icon
            if (server.status === ServerStatus.Connected) {
                statusItem.iconPath = new vscode.ThemeIcon('pass');
            } else if (server.status === ServerStatus.Error) {
                statusItem.iconPath = new vscode.ThemeIcon('error');
            } else {
                statusItem.iconPath = new vscode.ThemeIcon('circle-outline');
            }
            
            children.push(statusItem);
            
            // Type item
            const typeItem = new vscode.TreeItem(
                `Type: ${server.type}`,
                vscode.TreeItemCollapsibleState.None
            );
            typeItem.iconPath = new vscode.ThemeIcon('symbol-interface');
            typeItem.contextValue = 'serverType';
            children.push(typeItem);
            
            // Actions item (expandable)
            const actionsItem = new vscode.TreeItem(
                'Actions',
                vscode.TreeItemCollapsibleState.Collapsed
            );
            actionsItem.iconPath = new vscode.ThemeIcon('settings-gear');
            actionsItem.contextValue = 'serverActions';
            actionsItem.description = serverId; // Store server ID
            children.push(actionsItem);
            
            return children;
        }
        
        // Actions sub-items
        if (element && element.contextValue === 'serverActions') {
            const serverId = element.description as string;
            const server = this.mcpManager.getServerById(serverId);
            
            if (!server) {
                return [];
            }
            
            const actions: vscode.TreeItem[] = [];
            
            // Connect/Disconnect action
            if (server.status === ServerStatus.Connected) {
                const disconnectAction = new vscode.TreeItem(
                    'Disconnect',
                    vscode.TreeItemCollapsibleState.None
                );
                disconnectAction.command = {
                    command: 'devhub.disconnectService',
                    title: 'Disconnect',
                    arguments: [server]
                };
                disconnectAction.iconPath = new vscode.ThemeIcon('debug-disconnect');
                disconnectAction.contextValue = 'disconnectAction';
                actions.push(disconnectAction);
            } else {
                const connectAction = new vscode.TreeItem(
                    'Connect',
                    vscode.TreeItemCollapsibleState.None
                );
                connectAction.command = {
                    command: 'devhub.connectService',
                    title: 'Connect',
                    arguments: [server]
                };
                connectAction.iconPath = new vscode.ThemeIcon('plug');
                connectAction.contextValue = 'connectAction';
                actions.push(connectAction);
            }
            
            // Configure action
            const configureAction = new vscode.TreeItem(
                'Configure',
                vscode.TreeItemCollapsibleState.None
            );
            configureAction.command = {
                command: 'devhub.configureService',
                title: 'Configure',
                arguments: [server]
            };
            configureAction.iconPath = new vscode.ThemeIcon('settings');
            configureAction.contextValue = 'configureAction';
            actions.push(configureAction);
            
            // Test Connection action
            const testAction = new vscode.TreeItem(
                'Test Connection',
                vscode.TreeItemCollapsibleState.None
            );
            testAction.command = {
                command: 'devhub.testConnection',
                title: 'Test Connection',
                arguments: [server]
            };
            testAction.iconPath = new vscode.ThemeIcon('debug-start');
            testAction.contextValue = 'testAction';
            actions.push(testAction);
            
            return actions;
        }
        
        return [];
    }
}

export function createTreeView(context: vscode.ExtensionContext, mcpManager: McpManager): DevHubTreeDataProvider {
    const provider = new DevHubTreeDataProvider(mcpManager);
    const treeView = vscode.window.createTreeView('devhubDashboard', {
        treeDataProvider: provider,
        showCollapseAll: true
    });
    context.subscriptions.push(treeView);
    return provider;
}
