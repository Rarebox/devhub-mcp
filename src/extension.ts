import * as vscode from 'vscode';
import { McpManager } from './mcpManager';
import { createTreeView } from './treeView';
import { registerCommands } from './commands';
import { ClineIntegration } from './clineIntegration';
import { WebViewManager } from './webview';
import { DevHubState, McpServer, ServiceType, ServerStatus } from './types';

let mcpManager: McpManager;
let treeProvider: any;
let webViewManager: WebViewManager;
let clineIntegration: ClineIntegration;

export function activate(context: vscode.ExtensionContext) {
    console.log('DevHub extension is now active!');
    console.log('Extension context:', context.extensionPath);

    // 1. Initialize MCP Manager
    mcpManager = new McpManager(context);

    // 2. Register default servers
    mcpManager.registerServer({
        id: 'github',
        name: 'GitHub',
        type: ServiceType.GitHub,
        status: ServerStatus.Disconnected,
        config: {}
    });

    mcpManager.registerServer({
        id: 'mongodb',
        name: 'MongoDB',
        type: ServiceType.MongoDB,
        status: ServerStatus.Disconnected,
        config: {}
    });

    mcpManager.registerServer({
        id: 'auth',
        name: 'Authentication',
        type: ServiceType.Auth,
        status: ServerStatus.Disconnected,
        config: {}
    });

    mcpManager.registerServer({
        id: 'stripe',
        name: 'Stripe',
        type: ServiceType.Stripe,
        status: ServerStatus.Disconnected,
        config: {}
    });

    mcpManager.registerServer({
        id: 'lemonsqueezy',
        name: 'LemonSqueezy',
        type: ServiceType.LemonSqueezy,
        status: ServerStatus.Disconnected,
        config: {}
    });

    mcpManager.registerServer({
        id: 'context7-server',
        name: 'Context 7',
        type: ServiceType.Context7,
        status: ServerStatus.Disconnected,
        config: {}
    });

    mcpManager.registerServer({
        id: 'sequential-thinking-server',
        name: 'Sequential Thinking',
        type: ServiceType.SequentialThinking,
        status: ServerStatus.Disconnected,
        config: {}
    });

    mcpManager.registerServer({
        id: 'firecrawl-server',
        name: 'Firecrawl',
        type: ServiceType.Firecrawl,
        status: ServerStatus.Disconnected,
        config: {}
    });

    mcpManager.registerServer({
        id: 'filesystem-server',
        name: 'FileSystem',
        type: ServiceType.FileSystem,
        status: ServerStatus.Disconnected,
        config: {}
    });

    mcpManager.registerServer({
        id: 'browser-server',
        name: 'Browser',
        type: ServiceType.Browser,
        status: ServerStatus.Disconnected,
        config: {}
    });

    mcpManager.registerServer({
        id: 'figma-server',
        name: 'Figma',
        type: ServiceType.Figma,
        status: ServerStatus.Disconnected,
        config: {}
    });

    mcpManager.registerServer({
        id: 'supabase-server',
        name: 'Supabase',
        type: ServiceType.Supabase,
        status: ServerStatus.Disconnected,
        config: {}
    });

    mcpManager.registerServer({
        id: 'vercel-server',
        name: 'Vercel',
        type: ServiceType.Vercel,
        status: ServerStatus.Disconnected,
        config: {}
    });

    mcpManager.registerServer({
        id: 'sentry-server',
        name: 'Sentry',
        type: ServiceType.Sentry,
        status: ServerStatus.Disconnected,
        config: {}
    });

    mcpManager.registerServer({
        id: 'taskmaster-server',
        name: 'Taskmaster',
        type: ServiceType.Taskmaster,
        status: ServerStatus.Disconnected,
        config: {}
    });

    mcpManager.registerServer({
        id: 'desktop-commander-server',
        name: 'Desktop Commander',
        type: ServiceType.DesktopCommander,
        status: ServerStatus.Disconnected,
        config: {}
    });

    mcpManager.registerServer({
        id: '21st-dev-server',
        name: '21st Dev',
        type: ServiceType.Dev21,
        status: ServerStatus.Disconnected,
        config: {}
    });

    // 3. Create and register TreeView
    treeProvider = createTreeView(context, mcpManager);

    // 4. Initialize WebView Manager
    webViewManager = new WebViewManager(mcpManager);

    // 5. Register commands
    registerCommands(context, mcpManager, treeProvider, webViewManager);

    // 6. Initialize Cline integration
    clineIntegration = new ClineIntegration(mcpManager);

    // 7. Setup event listeners for real-time sync
    mcpManager.on('serverStatusChanged', (data: { serverId: string; status: ServerStatus }) => {
        console.log(`Extension: Received serverStatusChanged event for ${data.serverId} with status ${data.status}`);
        
        // Update TreeView
        treeProvider.refresh();
        
        // Update all open webviews
        webViewManager.updateAllWebviews();
    });

    mcpManager.on('serverConfigUpdated', (server: McpServer) => {
        // Update TreeView
        treeProvider.refresh();
        
        // Update all open webviews
        webViewManager.updateAllWebviews();
    });

    mcpManager.on('serverRegistered', (server: McpServer) => {
        // Update TreeView
        treeProvider.refresh();
        
        // Update all open webviews
        webViewManager.updateAllWebviews();
    });

    // 8. Welcome message
    vscode.window.showInformationMessage('🚀 DevHub activated! View services in sidebar.');
}

export function deactivate() {
    console.log('DevHub extension deactivated');
}
