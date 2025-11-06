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

    private handleWebviewMessage(panelId: string, message: any): void {
        try {
            switch (message.command) {
                case 'getServices':
                    // Services'i gönder
                    this.sendServicesUpdate(panelId);
                    break;
                case 'connectService':
                    this.connectToServer(message.serviceId);
                    // 1 saniye sonra update gönder
                    setTimeout(() => {
                        this.sendServicesUpdate(panelId);
                    }, 1000);
                    break;
                case 'disconnectService':
                    this.disconnectFromServer(message.serviceId);
                    setTimeout(() => {
                        this.sendServicesUpdate(panelId);
                    }, 1000);
                    break;
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
                    console.warn(`Unknown message type: ${message.command || message.type}`);
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

    private sendServicesUpdate(panelId: string): void {
        const panel = this.panels.get(panelId);
        if (panel) {
            const servers = this.mcpManager.getAllServers();
            panel.webview.postMessage({
                type: 'updateServices',
                services: servers
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
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevHub Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #1e1e1e 0%, #252526 100%);
            color: #e0e0e0;
            padding: 20px;
            min-height: 100vh;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        h1 {
            font-size: 2.5em;
            margin-bottom: 30px;
            background: linear-gradient(135deg, #007ACC, #1E90FF);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        #services-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        .service-card {
            background: linear-gradient(135deg, #2d2d30 0%, #3e3e42 100%);
            border: 1px solid #404040;
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s ease;
            cursor: pointer;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        }

        .service-card:hover {
            transform: translateY(-5px);
            border-color: #007ACC;
            box-shadow: 0 12px 24px rgba(0, 122, 204, 0.2);
        }

        .service-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .service-header h3 {
            font-size: 1.3em;
            color: #ffffff;
        }

        .status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
        }

        .status.connected {
            background-color: rgba(76, 175, 80, 0.2);
            color: #4CAF50;
        }

        .status.disconnected {
            background-color: rgba(244, 67, 54, 0.2);
            color: #f44336;
        }

        .service-type {
            color: #858585;
            font-size: 0.9em;
            margin-bottom: 15px;
        }

        .service-actions {
            display: flex;
            gap: 10px;
        }

        .btn-connect {
            flex: 1;
            padding: 10px 15px;
            background: linear-gradient(135deg, #007ACC, #1E90FF);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s ease;
        }

        .btn-connect:hover {
            background: linear-gradient(135deg, #005a9e, #1570d0);
            transform: scale(1.02);
        }

        .error-message {
            background: rgba(244, 67, 54, 0.1);
            border-left: 4px solid #f44336;
            color: #ffcdd2;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 DevHub Dashboard</h1>
        <p style="color: #a0a0a0; margin-bottom: 20px;">Manage your 17 MCP Services</p>
        <div id="services-container"></div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        // İlk load
        window.addEventListener('load', () => {
            vscode.postMessage({
                command: 'getServices'
            });
        });
        
        // Message listener
        window.addEventListener('message', event => {
            const message = event.data;
            
            if (message.type === 'updateServices') {
                renderServices(message.services);
            }
        });
        
        function renderServices(services) {
            const container = document.getElementById('services-container');
            
            if (!services || services.length === 0) {
                container.innerHTML = '<p>No services available</p>';
                return;
            }
            
            container.innerHTML = services.map(service => \`
                <div class="service-card">
                    <div class="service-header">
                        <h3>\${service.name}</h3>
                        <span class="status \${service.status === 'connected' ? 'connected' : 'disconnected'}">
                            \${service.status}
                        </span>
                    </div>
                    <div class="service-type">\${service.type}</div>
                    <div class="service-actions">
                        <button class="btn-connect" onclick="handleServiceAction('\${service.id}', '\${service.status}')">
                            \${service.status === 'connected' ? '✓ Connected' : 'Connect'}
                        </button>
                    </div>
                </div>
            \`).join('');
        }
        
        function handleServiceAction(serviceId, status) {
            if (status === 'connected') {
                vscode.postMessage({
                    command: 'disconnectService',
                    serviceId: serviceId
                });
            } else {
                vscode.postMessage({
                    command: 'connectService',
                    serviceId: serviceId
                });
            }
        }
    </script>
</body>
</html>`;
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
