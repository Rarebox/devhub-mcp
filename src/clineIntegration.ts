import * as vscode from 'vscode';
import { McpManager } from './mcpManager';
import { ClineIntegration as IClineIntegration } from './types';

export class ClineIntegration {
    private mcpManager: McpManager;
    private config: IClineIntegration;
    private statusBarItem: vscode.StatusBarItem;

    constructor(mcpManager: McpManager) {
        this.mcpManager = mcpManager;
        this.config = {
            enabled: false
        };
        
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        
        this.updateStatusBar();
        this.statusBarItem.show();
    }

    public async enableIntegration(serverUrl: string, apiKey: string): Promise<boolean> {
        try {
            // Validate inputs
            if (!serverUrl || !apiKey) {
                throw new Error('Server URL and API key are required');
            }

            // Test connection to Cline server
            const isConnected = await this.testClineConnection(serverUrl, apiKey);
            
            if (isConnected) {
                this.config = {
                    enabled: true,
                    serverUrl,
                    apiKey
                };

                // Setup event listeners for MCP manager
                this.setupEventListeners();
                
                this.updateStatusBar();
                vscode.window.showInformationMessage('Cline integration enabled successfully');
                return true;
            } else {
                throw new Error('Failed to connect to Cline server');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to enable Cline integration: ${error}`);
            return false;
        }
    }

    public disableIntegration(): void {
        this.config = {
            enabled: false
        };
        
        this.updateStatusBar();
        vscode.window.showInformationMessage('Cline integration disabled');
    }

    public isEnabled(): boolean {
        return this.config.enabled;
    }

    public getConfig(): IClineIntegration {
        return { ...this.config };
    }

    private async testClineConnection(serverUrl: string, apiKey: string): Promise<boolean> {
        try {
            // Simulate connection test (in real implementation, this would make actual HTTP request)
            console.log(`Testing Cline connection to ${serverUrl}...`);
            
            // Simulate async connection test
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // For now, always return true (in real implementation, validate actual connection)
            return true;
        } catch (error) {
            console.error('Cline connection test failed:', error);
            return false;
        }
    }

    private setupEventListeners(): void {
        if (!this.config.enabled) {
            return;
        }

        // Listen to MCP manager events and forward to Cline
        this.mcpManager.on('serverStatusChanged', (server) => {
            this.forwardToCline('serverStatusChanged', {
                serverId: server.id,
                status: server.status,
                timestamp: new Date().toISOString()
            });
        });

        this.mcpManager.on('serverRegistered', (server) => {
            this.forwardToCline('serverRegistered', {
                serverId: server.id,
                name: server.name,
                type: server.type,
                timestamp: new Date().toISOString()
            });
        });

        this.mcpManager.on('serverConfigUpdated', (server) => {
            this.forwardToCline('serverConfigUpdated', {
                serverId: server.id,
                config: server.config,
                timestamp: new Date().toISOString()
            });
        });
    }

    private async forwardToCline(event: string, data: any): Promise<void> {
        if (!this.config.enabled || !this.config.serverUrl || !this.config.apiKey) {
            return;
        }

        try {
            // In real implementation, this would make HTTP request to Cline server
            console.log(`Forwarding event ${event} to Cline:`, data);
            
            // Simulate HTTP request
            await new Promise(resolve => setTimeout(resolve, 100));
            
        } catch (error) {
            console.error(`Failed to forward event ${event} to Cline:`, error);
        }
    }

    private updateStatusBar(): void {
        if (this.config.enabled) {
            this.statusBarItem.text = '$(plug) Cline Connected';
            this.statusBarItem.tooltip = 'Cline integration is active';
            this.statusBarItem.color = '#4CAF50';
        } else {
            this.statusBarItem.text = '$(plug) Cline Disconnected';
            this.statusBarItem.tooltip = 'Cline integration is disabled';
            this.statusBarItem.color = undefined;
        }
    }

    public async showConfigurationDialog(): Promise<void> {
        try {
            const action = await vscode.window.showQuickPick(
                [
                    { label: 'Enable Integration', description: 'Connect to Cline server' },
                    { label: 'Disable Integration', description: 'Disconnect from Cline server' },
                    { label: 'Test Connection', description: 'Test current connection' },
                    { label: 'View Status', description: 'Show current integration status' }
                ],
                {
                    placeHolder: 'Select Cline integration action'
                }
            );

            if (!action) {
                return;
            }

            switch (action.label) {
                case 'Enable Integration':
                    await this.enableIntegrationDialog();
                    break;
                case 'Disable Integration':
                    this.disableIntegration();
                    break;
                case 'Test Connection':
                    await this.testCurrentConnection();
                    break;
                case 'View Status':
                    this.showStatus();
                    break;
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error in Cline configuration: ${error}`);
        }
    }

    private async enableIntegrationDialog(): Promise<void> {
        try {
            const serverUrl = await vscode.window.showInputBox({
                placeHolder: 'https://your-cline-server.com',
                prompt: 'Enter Cline server URL',
                value: this.config.serverUrl || ''
            });

            if (!serverUrl) {
                return;
            }

            const apiKey = await vscode.window.showInputBox({
                placeHolder: 'Your API key',
                prompt: 'Enter Cline API key',
                password: true,
                value: this.config.apiKey || ''
            });

            if (!apiKey) {
                return;
            }

            await this.enableIntegration(serverUrl, apiKey);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to enable integration: ${error}`);
        }
    }

    private async testCurrentConnection(): Promise<void> {
        if (!this.config.enabled || !this.config.serverUrl || !this.config.apiKey) {
            vscode.window.showWarningMessage('Cline integration is not enabled');
            return;
        }

        const isConnected = await this.testClineConnection(
            this.config.serverUrl,
            this.config.apiKey
        );

        if (isConnected) {
            vscode.window.showInformationMessage('Cline connection test successful');
        } else {
            vscode.window.showErrorMessage('Cline connection test failed');
        }
    }

    private showStatus(): void {
        const status = this.config.enabled ? 'Enabled' : 'Disabled';
        const serverUrl = this.config.serverUrl || 'Not configured';
        
        const message = `
Cline Integration Status:
• Status: ${status}
• Server URL: ${serverUrl}
• API Key: ${this.config.apiKey ? 'Configured' : 'Not configured'}
        `.trim();

        vscode.window.showInformationMessage(message, 'OK');
    }

    public dispose(): void {
        this.statusBarItem.dispose();
        this.disableIntegration();
    }
}
