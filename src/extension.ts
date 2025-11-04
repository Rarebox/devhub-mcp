import * as vscode from 'vscode';
import { McpManager } from './mcpManager';
import { createTreeView } from './treeView';
import { registerCommands } from './commands';
import { ClineIntegration } from './clineIntegration';
import { DevHubState, McpServer, ServiceType, ServerStatus } from './types';

let mcpManager: McpManager;
let treeProvider: any;
let clineIntegration: ClineIntegration;

export function activate(context: vscode.ExtensionContext) {
    console.log('DevHub extension is now active!');

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

    // 3. Create and register TreeView
    treeProvider = createTreeView(context, mcpManager);

    // 4. Register commands
    registerCommands(context, mcpManager, treeProvider);

    // 5. Initialize Cline integration
    clineIntegration = new ClineIntegration(mcpManager);

    // 6. Welcome message
    vscode.window.showInformationMessage('🚀 DevHub activated! View services in sidebar.');
}

export function deactivate() {
    console.log('DevHub extension deactivated');
}
