import * as vscode from 'vscode';
import { McpManager } from './mcpManager';
import { DevHubTreeDataProvider } from './treeView';
import { createDashboard } from './webview';
import { ConfigurationPanel } from './ui/configurationPanel';
import { McpServer, ServiceType, ServerStatus } from './types';

export function registerCommands(
    context: vscode.ExtensionContext,
    mcpManager: McpManager,
    treeProvider: any,
    webViewManager?: any
): void {
    // 1. devhub.openDashboard - Dashboard panel aç
    const openDashboard = vscode.commands.registerCommand('devhub.openDashboard', async () => {
        try {
            createDashboard(context, mcpManager);
            vscode.window.showInformationMessage('Dashboard opened!');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open dashboard: ${error}`);
            console.error('Dashboard open error:', error);
        }
    });

    // 2. devhub.refreshServices - Tüm servisleri refresh et
    const refreshServices = vscode.commands.registerCommand('devhub.refreshServices', async () => {
        try {
            treeProvider.refresh();
            vscode.window.showInformationMessage('✓ Services refreshed!');
            console.log('Services refreshed');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to refresh services: ${error}`);
        }
    });

    // 3. devhub.connectService - Service'e bağlan
    const connectService = vscode.commands.registerCommand('devhub.connectService', async (serverIdOrTreeItem?: string | vscode.TreeItem) => {
        try {
            let serverId: string | undefined;
            
            // TreeItem'dan mı geldi yoksa direct serverId mi?
            if (typeof serverIdOrTreeItem === 'string') {
                serverId = serverIdOrTreeItem;
            } else if (serverIdOrTreeItem && serverIdOrTreeItem.description) {
                serverId = serverIdOrTreeItem.description as string;
            }
            
            // Eğer serverId yoksa, QuickPick göster
            if (!serverId) {
                const servers = mcpManager.getAllServers();
                const disconnectedServers = servers.filter(s => s.status === 'disconnected');
                
                if (disconnectedServers.length === 0) {
                    vscode.window.showInformationMessage('All services are already connected!');
                    return;
                }
                
                const selected = await vscode.window.showQuickPick(
                    disconnectedServers.map(s => ({
                        label: s.name,
                        description: s.type,
                        detail: `Status: ${s.status}`,
                        id: s.id
                    })),
                    {
                        placeHolder: 'Select a service to connect',
                        title: 'Connect Service'
                    }
                );
                
                if (!selected) {
                    return; // User cancelled
                }
                
                serverId = selected.id;
            }
            
            // Server'ı bul
            const server = mcpManager.getServerById(serverId);
            if (!server) {
                vscode.window.showErrorMessage(`Server not found: ${serverId}`);
                return;
            }
            
            // Progress göster
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Connecting to ${server.name}...`,
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0 });
                
                const success = await mcpManager.connectServer(serverId!);
                
                progress.report({ increment: 100 });
                
                if (success) {
                    vscode.window.showInformationMessage(`✓ Connected to ${server.name}`);
                } else {
                    vscode.window.showErrorMessage(`✗ Failed to connect to ${server.name}`);
                }
            });
            
        } catch (error) {
            vscode.window.showErrorMessage(`Connection error: ${error}`);
            console.error('Connect service error:', error);
        }
    });

    // 4. devhub.disconnectService - Service'ten disconnect
    const disconnectService = vscode.commands.registerCommand('devhub.disconnectService', async (serverIdOrTreeItem?: string | vscode.TreeItem) => {
        try {
            let serverId: string | undefined;
            
            // TreeItem'dan mı geldi yoksa direct serverId mi?
            if (typeof serverIdOrTreeItem === 'string') {
                serverId = serverIdOrTreeItem;
            } else if (serverIdOrTreeItem && serverIdOrTreeItem.description) {
                serverId = serverIdOrTreeItem.description as string;
            }
            
            // Eğer serverId yoksa, QuickPick göster
            if (!serverId) {
                const servers = mcpManager.getAllServers();
                const connectedServers = servers.filter(s => s.status === 'connected');
                
                if (connectedServers.length === 0) {
                    vscode.window.showInformationMessage('No services are connected!');
                    return;
                }
                
                const selected = await vscode.window.showQuickPick(
                    connectedServers.map(s => ({
                        label: s.name,
                        description: s.type,
                        detail: `Status: ${s.status}`,
                        id: s.id
                    })),
                    {
                        placeHolder: 'Select a service to disconnect',
                        title: 'Disconnect Service'
                    }
                );
                
                if (!selected) {
                    return;
                }
                
                serverId = selected.id;
            }
            
            // Server'ı bul
            const server = mcpManager.getServerById(serverId);
            if (!server) {
                vscode.window.showErrorMessage(`Server not found: ${serverId}`);
                return;
            }
            
            // Confirmation dialog
            const confirm = await vscode.window.showWarningMessage(
                `Are you sure you want to disconnect from ${server.name}?`,
                'Disconnect',
                'Cancel'
            );
            
            if (confirm !== 'Disconnect') {
                return;
            }
            
            // Disconnect
            await mcpManager.disconnectServer(serverId);
            vscode.window.showInformationMessage(`✓ Disconnected from ${server.name}`);
            
        } catch (error) {
            vscode.window.showErrorMessage(`Disconnect error: ${error}`);
            console.error('Disconnect service error:', error);
        }
    });

    // 5. devhub.configureService - Service configuration
    const configureService = vscode.commands.registerCommand('devhub.configureService', async (serverIdOrTreeItem?: string | vscode.TreeItem) => {
        try {
            let serverId: string | undefined;
            
            if (typeof serverIdOrTreeItem === 'string') {
                serverId = serverIdOrTreeItem;
            } else if (serverIdOrTreeItem && serverIdOrTreeItem.description) {
                serverId = serverIdOrTreeItem.description as string;
            }
            
            if (!serverId) {
                const servers = mcpManager.getAllServers();
                const selected = await vscode.window.showQuickPick(
                    servers.map(s => ({
                        label: s.name,
                        description: s.type,
                        detail: `Status: ${s.status}`,
                        id: s.id
                    })),
                    {
                        placeHolder: 'Select a service to configure',
                        title: 'Configure Service'
                    }
                );
                
                if (!selected) {
                    return;
                }
                
                serverId = selected.id;
            }
            
            const server = mcpManager.getServerById(serverId);
            if (!server) {
                vscode.window.showErrorMessage(`Server not found: ${serverId}`);
                return;
            }
            
            // Panel aç
            const panel = ConfigurationPanel.createPanel(
                context.extensionUri,
                serverId,
                server.name,
                server.apiKeyUrl  // ← YENİ
            );
            
            // Message listener
            panel.webview.onDidReceiveMessage((message) => {
                if (message.command === 'saveConfig') {
                    // Config'i kaydet
                    context.secrets.store(`${serverId}-config`, JSON.stringify(message.config));
                    
                    // Server config'ini güncelle
                    mcpManager.updateServerConfig(serverId, message.config);
                    
                    vscode.window.showInformationMessage(
                        `${server.name} configuration saved!`
                    );
                    
                    panel.dispose();
                }
            });
            
        } catch (error) {
            vscode.window.showErrorMessage(`Configuration error: ${error}`);
        }
    });

    // 6. devhub.testConnection - Connection test
    const testConnection = vscode.commands.registerCommand('devhub.testConnection', async (serverIdOrTreeItem?: string | vscode.TreeItem) => {
        try {
            let serverId: string | undefined;
            
            if (typeof serverIdOrTreeItem === 'string') {
                serverId = serverIdOrTreeItem;
            } else if (serverIdOrTreeItem && serverIdOrTreeItem.description) {
                serverId = serverIdOrTreeItem.description as string;
            }
            
            if (!serverId) {
                vscode.window.showWarningMessage('Please select a server from tree view');
                return;
            }
            
            const server = mcpManager.getServerById(serverId);
            if (!server) {
                vscode.window.showErrorMessage(`Server not found: ${serverId}`);
                return;
            }
            
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Testing connection to ${server.name}...`,
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0 });
                
                // Simulate test (1 second delay)
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                progress.report({ increment: 100 });
                
                const status = mcpManager.getServerStatus(serverId);
                if (status === ServerStatus.Connected) {
                    vscode.window.showInformationMessage(`✓ ${server.name} connection is healthy`);
                } else {
                    vscode.window.showWarningMessage(`${server.name} is not connected`);
                }
            });
            
        } catch (error) {
            vscode.window.showErrorMessage(`Test connection error: ${error}`);
        }
    });

    // 7. devhub.viewLogs - Activity logs göster
    const viewLogs = vscode.commands.registerCommand('devhub.viewLogs', async () => {
        try {
            const outputChannel = vscode.window.createOutputChannel('DevHub Logs');
            outputChannel.show();
            outputChannel.clear();
            outputChannel.appendLine('='.repeat(50));
            outputChannel.appendLine('DevHub Activity Logs');
            outputChannel.appendLine('='.repeat(50));
            outputChannel.appendLine('');
            outputChannel.appendLine(`[${new Date().toLocaleTimeString()}] Extension activated`);
            outputChannel.appendLine('');
            
            const servers = mcpManager.getAllServers();
            outputChannel.appendLine('Registered Services:');
            servers.forEach(server => {
                outputChannel.appendLine(`  - ${server.name} (${server.type}): ${server.status}`);
            });
            
            outputChannel.appendLine('');
            outputChannel.appendLine('Note: Detailed logs will be available in Phase 3');
            
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open logs: ${error}`);
        }
    });

    // 8. devhub.showServerInfo - Server bilgilerini göster
    const showServerInfo = vscode.commands.registerCommand('devhub.showServerInfo', async () => {
        try {
            const servers = mcpManager.getAllServers();
            const connectedCount = servers.filter(s => s.status === 'connected').length;
            const disconnectedCount = servers.filter(s => s.status === 'disconnected').length;
            const errorCount = servers.filter(s => s.status === 'error').length;
            
            const message = `DevHub Status:\n` +
                           `Total Services: ${servers.length}\n` +
                           `Connected: ${connectedCount}\n` +
                           `Disconnected: ${disconnectedCount}\n` +
                           `Errors: ${errorCount}`;
            
            vscode.window.showInformationMessage(message, 'Open Dashboard').then(selection => {
                if (selection === 'Open Dashboard') {
                    vscode.commands.executeCommand('devhub.openDashboard');
                }
            });
            
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to show server info: ${error}`);
        }
    });

    // 9. devhub.connectAll - Tüm servislere bağlan
    const connectAll = vscode.commands.registerCommand('devhub.connectAll', async () => {
        try {
            const servers = mcpManager.getAllServers();
            const disconnectedServers = servers.filter(s => s.status === 'disconnected');
            
            if (disconnectedServers.length === 0) {
                vscode.window.showInformationMessage('All services are already connected!');
                return;
            }
            
            const confirm = await vscode.window.showInformationMessage(
                `Connect to ${disconnectedServers.length} service(s)?`,
                'Connect All',
                'Cancel'
            );
            
            if (confirm !== 'Connect All') {
                return;
            }
            
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Connecting to all services...',
                cancellable: false
            }, async (progress) => {
                const increment = 100 / disconnectedServers.length;
                let successCount = 0;
                
                for (const server of disconnectedServers) {
                    progress.report({
                        message: `Connecting to ${server.name}...`,
                        increment: 0
                    });
                    
                    const success = await mcpManager.connectServer(server.id);
                    if (success) {
                        successCount++;
                    }
                    
                    progress.report({ increment });
                }
                
                vscode.window.showInformationMessage(
                    `✓ Connected to ${successCount}/${disconnectedServers.length} services`
                );
            });
            
        } catch (error) {
            vscode.window.showErrorMessage(`Connect all error: ${error}`);
        }
    });

    // 10. devhub.disconnectAll - Tüm servislerden disconnect
    const disconnectAll = vscode.commands.registerCommand('devhub.disconnectAll', async () => {
        try {
            const servers = mcpManager.getAllServers();
            const connectedServers = servers.filter(s => s.status === 'connected');
            
            if (connectedServers.length === 0) {
                vscode.window.showInformationMessage('No services are connected!');
                return;
            }
            
            const confirm = await vscode.window.showWarningMessage(
                `Disconnect from ${connectedServers.length} service(s)?`,
                'Disconnect All',
                'Cancel'
            );
            
            if (confirm !== 'Disconnect All') {
                return;
            }
            
            for (const server of connectedServers) {
                await mcpManager.disconnectServer(server.id);
            }
            
            vscode.window.showInformationMessage(
                `✓ Disconnected from all services`
            );
            
        } catch (error) {
            vscode.window.showErrorMessage(`Disconnect all error: ${error}`);
        }
    });

    // 11. devhub.listGitHubRepos - GitHub repository listesini göster
    const listGitHubRepos = vscode.commands.registerCommand('devhub.listGitHubRepos', async () => {
        try {
            const githubServer = mcpManager.getGitHubServer();
            if (!githubServer) {
                vscode.window.showWarningMessage('GitHub is not connected. Please connect first.');
                return;
            }

            // Show loading
            vscode.window.showInformationMessage('Fetching GitHub repositories...');

            // Get repositories
            const repos = await githubServer.listRepositories();
            
            if (repos.length === 0) {
                vscode.window.showInformationMessage('No repositories found.');
                return;
            }

            // Show in QuickPick
            const items = repos.map(repo => ({
                label: repo.name,
                description: repo.description || 'No description',
                detail: `⭐ ${repo.stars} | 🍴 ${repo.forks} | 🐛 ${repo.open_issues} issues`,
                repo: repo
            }));

            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: `Select a repository (${repos.length} total)`,
                matchOnDescription: true,
                matchOnDetail: true
            });

            if (selected) {
                // Open in browser
                vscode.env.openExternal(vscode.Uri.parse(selected.repo.url));
            }

        } catch (error) {
            console.error('Error listing GitHub repos:', error);
            vscode.window.showErrorMessage(`Failed to list repositories: ${error}`);
        }
    });

    // Tüm command'ları context.subscriptions'a push et
    context.subscriptions.push(
        openDashboard,
        refreshServices,
        connectService,
        disconnectService,
        configureService,
        testConnection,
        viewLogs,
        showServerInfo,
        connectAll,
        disconnectAll,
        listGitHubRepos
    );
    
    console.log('DevHub commands registered successfully');
}
