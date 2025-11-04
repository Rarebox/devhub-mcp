import * as vscode from 'vscode';
import { McpManager } from './mcpManager';
import { McpServer, WebViewMessage } from './types';

export class WebViewManager {
    private panels: Map<string, vscode.WebviewPanel> = new Map();
    private mcpManager: McpManager;

    constructor(mcpManager: McpManager) {
        this.mcpManager = mcpManager;
    }

    public createServerDashboard(server: McpServer): vscode.WebviewPanel {
        const panel = vscode.window.createWebviewPanel(
            'serverDashboard',
            `${server.name} Dashboard`,
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [vscode.Uri.joinPath(vscode.workspace.workspaceFolders?.[0]?.uri || vscode.Uri.file(''), 'resources')]
            }
        );

        // Store panel reference
        this.panels.set(server.id, panel);

        // Set webview content
        panel.webview.html = this.getDashboardHtml(server);

        // Handle messages from webview
        panel.webview.onDidReceiveMessage(
            (message: WebViewMessage) => this.handleWebviewMessage(server.id, message),
            undefined
        );

        // Handle panel disposal
        panel.onDidDispose(() => {
            this.panels.delete(server.id);
        });

        return panel;
    }

    public createMainDashboard(): vscode.WebviewPanel {
        const panel = vscode.window.createWebviewPanel(
            'mainDashboard',
            'DevHub Dashboard',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [vscode.Uri.joinPath(vscode.workspace.workspaceFolders?.[0]?.uri || vscode.Uri.file(''), 'resources')]
            }
        );

        // Store panel reference
        this.panels.set('main', panel);

        // Set webview content
        panel.webview.html = this.getMainDashboardHtml();

        // Handle messages from webview
        panel.webview.onDidReceiveMessage(
            (message: WebViewMessage) => this.handleWebviewMessage('main', message),
            undefined
        );

        // Handle panel disposal
        panel.onDidDispose(() => {
            this.panels.delete('main');
        });

        return panel;
    }

    private handleWebviewMessage(panelId: string, message: WebViewMessage): void {
        try {
            switch (message.type) {
                case 'refreshServers':
                    this.refreshServersData(panelId);
                    break;
                case 'connectServer':
                    this.connectToServer(message.data?.serverId);
                    break;
                case 'disconnectServer':
                    this.disconnectFromServer(message.data?.serverId);
                    break;
                case 'configureServer':
                    this.configureServer(message.data?.serverId);
                    break;
                case 'testConnection':
                    this.testServerConnection(message.data?.serverId);
                    break;
                default:
                    console.warn(`Unknown message type: ${message.type}`);
            }
        } catch (error) {
            console.error('Error handling webview message:', error);
        }
    }

    private refreshServersData(panelId: string): void {
        const panel = this.panels.get(panelId);
        if (panel) {
            const servers = this.mcpManager.getAllServers();
            panel.webview.postMessage({
                type: 'serversUpdated',
                data: { servers }
            });
        }
    }

    private async connectToServer(serverId: string): Promise<void> {
        try {
            const success = await this.mcpManager.connectServer(serverId);
            if (success) {
                vscode.window.showInformationMessage('Server connected successfully');
            } else {
                vscode.window.showErrorMessage('Failed to connect to server');
            }
            this.refreshServersData('main');
        } catch (error) {
            vscode.window.showErrorMessage(`Error connecting to server: ${error}`);
        }
    }

    private async disconnectFromServer(serverId: string): Promise<void> {
        try {
            await this.mcpManager.disconnectServer(serverId);
            vscode.window.showInformationMessage('Server disconnected successfully');
            this.refreshServersData('main');
        } catch (error) {
            vscode.window.showErrorMessage(`Error disconnecting from server: ${error}`);
        }
    }

    private async configureServer(serverId: string): Promise<void> {
        try {
            const server = this.mcpManager.getServerById(serverId);
            if (server) {
                // Open configuration dialog (simplified)
                const configKey = await vscode.window.showInputBox({
                    placeHolder: 'Configuration key',
                    prompt: `Enter configuration key for ${server.name}`,
                    value: 'apiKey'
                });

                if (configKey) {
                    const configValue = await vscode.window.showInputBox({
                        placeHolder: 'Configuration value',
                        prompt: `Enter value for ${configKey}`,
                        password: configKey.toLowerCase().includes('key')
                    });

                    if (configValue) {
                        const success = this.mcpManager.updateServerConfig(serverId, { [configKey]: configValue });
                        if (success) {
                            vscode.window.showInformationMessage('Configuration updated successfully');
                        } else {
                            vscode.window.showErrorMessage('Failed to update configuration');
                        }
                        this.refreshServersData('main');
                    }
                }
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error configuring server: ${error}`);
        }
    }

    private async testServerConnection(serverId: string): Promise<void> {
        try {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Testing connection...',
                cancellable: false
            }, async () => {
                // Simulate connection test
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                const status = this.mcpManager.getServerStatus(serverId);
                if (status === 'connected') {
                    vscode.window.showInformationMessage('Connection test successful');
                } else {
                    vscode.window.showErrorMessage('Connection test failed');
                }
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Error testing connection: ${error}`);
        }
    }

    private getDashboardHtml(server: McpServer): string {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${server.name} Dashboard</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            margin: 0;
        }
        .header {
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .status {
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
            border-left: 4px solid;
        }
        .status.connected {
            background-color: var(--vscode-testing-iconPassed);
            border-left-color: #4CAF50;
        }
        .status.disconnected {
            background-color: var(--vscode-testing-iconSkipped);
            border-left-color: #FF9800;
        }
        .status.error {
            background-color: var(--vscode-testing-iconFailed);
            border-left-color: #F44336;
        }
        .config-section {
            margin: 20px 0;
        }
        .config-section h3 {
            margin-bottom: 10px;
            color: var(--vscode-foreground);
        }
        .config-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        .config-key {
            font-weight: bold;
            color: var(--vscode-descriptionForeground);
        }
        .config-value {
            color: var(--vscode-foreground);
            word-break: break-all;
        }
        .actions {
            margin-top: 20px;
        }
        .btn {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            margin-right: 10px;
            border-radius: 4px;
            cursor: pointer;
        }
        .btn:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        pre {
            background-color: var(--vscode-textBlockQuote-background);
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
            font-family: var(--vscode-editor-font-family);
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${server.name}</h1>
        <p><strong>Type:</strong> ${server.type}</p>
        <p><strong>ID:</strong> ${server.id}</p>
    </div>
    
    <div class="status ${server.status}">
        <h3>Status: ${server.status.toUpperCase()}</h3>
        <p><strong>Last Connected:</strong> ${server.lastConnected?.toLocaleString() || 'Never'}</p>
        ${server.error ? `<p><strong>Error:</strong> ${server.error}</p>` : ''}
    </div>
    
    <div class="config-section">
        <h3>Configuration</h3>
        ${Object.keys(server.config).length > 0 ? 
            Object.entries(server.config).map(([key, value]) => `
                <div class="config-item">
                    <span class="config-key">${key}:</span>
                    <span class="config-value">${typeof value === 'object' ? JSON.stringify(value) : value}</span>
                </div>
            `).join('') : 
            '<p>No configuration set</p>'
        }
    </div>
    
    <div class="actions">
        ${server.status === 'disconnected' ? 
            `<button class="btn" onclick="connectServer()">Connect</button>` :
            `<button class="btn" onclick="disconnectServer()">Disconnect</button>`
        }
        <button class="btn" onclick="testConnection()">Test Connection</button>
        <button class="btn" onclick="configureServer()">Configure</button>
    </div>
    
    <script>
        const vscode = acquireVsCodeApi();
        
        function connectServer() {
            vscode.postMessage({
                type: 'connectServer',
                data: { serverId: '${server.id}' }
            });
        }
        
        function disconnectServer() {
            vscode.postMessage({
                type: 'disconnectServer',
                data: { serverId: '${server.id}' }
            });
        }
        
        function testConnection() {
            vscode.postMessage({
                type: 'testConnection',
                data: { serverId: '${server.id}' }
            });
        }
        
        function configureServer() {
            vscode.postMessage({
                type: 'configureServer',
                data: { serverId: '${server.id}' }
            });
        }
    </script>
</body>
</html>
        `;
    }

    private getMainDashboardHtml(): string {
        const servers = this.mcpManager.getAllServers();
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevHub Dashboard</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            margin: 0;
        }
        .header {
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .servers-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .server-card {
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 20px;
            background-color: var(--vscode-editor-background);
        }
        .server-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .server-name {
            font-size: 18px;
            font-weight: bold;
            color: var(--vscode-foreground);
        }
        .server-type {
            background-color: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
        }
        .server-status {
            display: flex;
            align-items: center;
            margin: 10px 0;
        }
        .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }
        .status-indicator.connected { background-color: #4CAF50; }
        .status-indicator.disconnected { background-color: #FF9800; }
        .status-indicator.error { background-color: #F44336; }
        .server-actions {
            margin-top: 15px;
        }
        .btn {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 6px 12px;
            margin-right: 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        }
        .btn:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        .btn:disabled {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            cursor: not-allowed;
        }
        .empty-state {
            text-align: center;
            padding: 40px;
            color: var(--vscode-descriptionForeground);
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>DevHub Dashboard</h1>
        <p>Manage your developer services from one place</p>
    </div>
    
    <div class="servers-grid">
        ${servers.length > 0 ? 
            servers.map(server => `
                <div class="server-card">
                    <div class="server-header">
                        <div class="server-name">${server.name}</div>
                        <div class="server-type">${server.type}</div>
                    </div>
                    <div class="server-status">
                        <div class="status-indicator ${server.status}"></div>
                        <span>${server.status.toUpperCase()}</span>
                    </div>
                    <div class="server-actions">
                        ${server.status === 'disconnected' ? 
                            `<button class="btn" onclick="connectServer('${server.id}')">Connect</button>` :
                            `<button class="btn" onclick="disconnectServer('${server.id}')">Disconnect</button>`
                        }
                        <button class="btn" onclick="testConnection('${server.id}')">Test</button>
                        <button class="btn" onclick="configureServer('${server.id}')">Configure</button>
                    </div>
                </div>
            `).join('') : 
            '<div class="empty-state">No servers configured. Add your first server to get started.</div>'
        }
    </div>
    
    <script>
        const vscode = acquireVsCodeApi();
        
        function connectServer(serverId) {
            vscode.postMessage({
                type: 'connectServer',
                data: { serverId }
            });
        }
        
        function disconnectServer(serverId) {
            vscode.postMessage({
                type: 'disconnectServer',
                data: { serverId }
            });
        }
        
        function testConnection(serverId) {
            vscode.postMessage({
                type: 'testConnection',
                data: { serverId }
            });
        }
        
        function configureServer(serverId) {
            vscode.postMessage({
                type: 'configureServer',
                data: { serverId }
            });
        }
        
        // Listen for updates from extension
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.type === 'serversUpdated') {
                // Refresh the dashboard with new server data
                location.reload();
            }
        });
    </script>
</body>
</html>
        `;
    }

    public dispose(): void {
        // Dispose all webview panels
        this.panels.forEach(panel => panel.dispose());
        this.panels.clear();
    }
}

// Export function for creating dashboard
export function createDashboard(context: vscode.ExtensionContext, mcpManager: McpManager): void {
    const webViewManager = new WebViewManager(mcpManager);
    webViewManager.createMainDashboard();
}
