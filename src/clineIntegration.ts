import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { McpManager } from './mcpManager';
import { McpServer, ServiceType, ServerStatus } from './types';

interface ClineMcpSettings {
    mcpServers: {
        [serverName: string]: {
            command?: string;
            args?: string[];
            url?: string;
            env?: { [key: string]: string };
            disabled?: boolean;
            autoApprove?: string[];
        };
    };
}

export class ClineIntegration {
    private mcpManager: McpManager;
    private statusBarItem: vscode.StatusBarItem;
    private clineSettingsPath: string;

    constructor(mcpManager: McpManager) {
        this.mcpManager = mcpManager;
        
        // Get Cline settings path (cross-platform)
        this.clineSettingsPath = this.getClineSettingsPath();
        
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        
        this.updateStatusBar();
        this.statusBarItem.show();
        
        // Setup event listeners for MCP manager
        this.setupEventListeners();
    }

    private getClineSettingsPath(): string {
        const homeDir = os.homedir();
        const platform = os.platform();
        
        switch (platform) {
            case 'darwin': // macOS
                return path.join(
                    homeDir,
                    'Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json'
                );
            case 'win32': // Windows
                return path.join(
                    homeDir,
                    'AppData/Roaming/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json'
                );
            case 'linux': // Linux
                return path.join(
                    homeDir,
                    '.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json'
                );
            default:
                // Fallback to macOS style
                return path.join(
                    homeDir,
                    'Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json'
                );
        }
    }

    private getExtensionPath(): string {
        // Get the extension installation path from VS Code
        const extension = vscode.extensions.getExtension('caglarusta.devhub-mcp');
        if (extension) {
            return extension.extensionPath;
        }
        
        // Fallback to development path
        return path.join(__dirname, '..');
    }

    private setupEventListeners(): void {
        // Listen to MCP manager events
        this.mcpManager.on('serverStatusChanged', (data: { serverId: string; status: ServerStatus }) => {
            console.log(`ClineIntegration: Server status changed - ${data.serverId}: ${data.status}`);
            
            if (data.status === ServerStatus.Connected) {
                this.addServerToClineSettings(data.serverId);
            } else if (data.status === ServerStatus.Disconnected) {
                this.removeServerFromClineSettings(data.serverId);
            }
        });

        this.mcpManager.on('serverRegistered', (server: McpServer) => {
            console.log(`ClineIntegration: Server registered - ${server.id}`);
        });

        this.mcpManager.on('serverConfigUpdated', (server: McpServer) => {
            console.log(`ClineIntegration: Server config updated - ${server.id}`);
            if (server.status === ServerStatus.Connected) {
                this.addServerToClineSettings(server.id);
            }
        });
    }

    private async addServerToClineSettings(serverId: string): Promise<void> {
        try {
            const server = this.mcpManager.getServerById(serverId);
            if (!server) {
                console.error(`Server not found: ${serverId}`);
                return;
            }

            // Read current Cline settings
            let settings: ClineMcpSettings;
            try {
                const settingsContent = fs.readFileSync(this.clineSettingsPath, 'utf8');
                settings = JSON.parse(settingsContent);
            } catch (error) {
                // File doesn't exist or is invalid, create new
                settings = { mcpServers: {} };
            }

            // Create MCP server configuration for DevHub
            const mcpServerConfig = this.createMcpServerConfig(server);
            
            // Add to Cline settings
            settings.mcpServers[`devhub-${serverId}`] = mcpServerConfig;

            // Write back to file
            await this.writeClineSettings(settings);
            
            console.log(`Added devhub-${serverId} to Cline MCP settings`);
            vscode.window.showInformationMessage(
                `✅ ${server.name} added to Cline MCP servers!`
            );

        } catch (error) {
            console.error(`Failed to add server ${serverId} to Cline settings:`, error);
            vscode.window.showErrorMessage(
                `Failed to add ${serverId} to Cline: ${error}`
            );
        }
    }

    private async removeServerFromClineSettings(serverId: string): Promise<void> {
        try {
            // Read current Cline settings
            let settings: ClineMcpSettings;
            try {
                const settingsContent = fs.readFileSync(this.clineSettingsPath, 'utf8');
                settings = JSON.parse(settingsContent);
            } catch (error) {
                return; // File doesn't exist, nothing to remove
            }

            // Remove from Cline settings
            delete settings.mcpServers[`devhub-${serverId}`];

            // Write back to file
            await this.writeClineSettings(settings);
            
            console.log(`Removed devhub-${serverId} from Cline MCP settings`);

        } catch (error) {
            console.error(`Failed to remove server ${serverId} from Cline settings:`, error);
        }
    }

    private createMcpServerConfig(server: McpServer): any {
        const baseConfig = {
            disabled: false,
            autoApprove: []
        };

        // Get extension path for correct file paths
        const extensionPath = this.getExtensionPath();
        const outPath = path.join(extensionPath, 'out');

        switch (server.type) {
            case ServiceType.GitHub:
                return {
                    ...baseConfig,
                    command: 'node',
                    args: [path.join(outPath, 'mcp-servers/github/index.js')],
                    env: {
                        GITHUB_TOKEN: server.config.token || '',
                        MCP_MODE: 'stdio'
                    }
                };

            case ServiceType.MongoDB:
                return {
                    ...baseConfig,
                    command: 'node',
                    args: [path.join(outPath, 'mcp-servers/mongodb/index.js')],
                    env: {
                        MONGODB_CONNECTION_STRING: server.config.connectionString || '',
                        MONGODB_DATABASE: server.config.database || '',
                        MCP_MODE: 'stdio'
                    }
                };

            case ServiceType.Stripe:
                return {
                    ...baseConfig,
                    command: 'node',
                    args: [path.join(outPath, 'mcp-servers/stripe/index.js')],
                    env: {
                        STRIPE_API_KEY: server.config.apiKey || '',
                        MCP_MODE: 'stdio'
                    }
                };

            case ServiceType.LemonSqueezy:
                return {
                    ...baseConfig,
                    command: 'node',
                    args: [path.join(outPath, 'mcp-servers/lemonsqueezy/index.js')],
                    env: {
                        LEMONSQUEEZY_API_KEY: server.config.apiKey || '',
                        MCP_MODE: 'stdio'
                    }
                };

            case ServiceType.Auth:
                return {
                    ...baseConfig,
                    command: 'node',
                    args: [path.join(outPath, 'mcp-servers/auth/index.js')],
                    env: {
                        AUTH_API_KEY: server.config.apiKey || '',
                        MCP_MODE: 'stdio'
                    }
                };

            case ServiceType.Context7:
                return {
                    ...baseConfig,
                    command: 'node',
                    args: [path.join(outPath, 'mcp-servers/context7/index.js')],
                    env: {
                        CONTEXT7_API_KEY: server.config.apiKey || '',
                        MCP_MODE: 'stdio'
                    }
                };

            case ServiceType.SequentialThinking:
                return {
                    ...baseConfig,
                    command: 'node',
                    args: [path.join(outPath, 'mcp-servers/sequential-thinking/index.js')],
                    env: {
                        SEQUENTIAL_THINKING_API_KEY: server.config.apiKey || '',
                        MCP_MODE: 'stdio'
                    }
                };

            case ServiceType.Firecrawl:
                return {
                    ...baseConfig,
                    command: 'node',
                    args: [path.join(outPath, 'mcp-servers/firecrawl/index.js')],
                    env: {
                        FIRECRAWL_API_KEY: server.config.apiKey || '',
                        MCP_MODE: 'stdio'
                    }
                };

            case ServiceType.FileSystem:
                return {
                    ...baseConfig,
                    command: 'node',
                    args: [path.join(outPath, 'mcp-servers/filesystem/index.js')],
                    env: {
                        FILESYSTEM_ROOT_PATH: server.config.rootPath || process.cwd(),
                        MCP_MODE: 'stdio'
                    }
                };

            case ServiceType.Browser:
                return {
                    ...baseConfig,
                    command: 'node',
                    args: [path.join(outPath, 'mcp-servers/browser/index.js')],
                    env: {
                        BROWSER_API_KEY: server.config.apiKey || '',
                        MCP_MODE: 'stdio'
                    }
                };

            case ServiceType.Figma:
                return {
                    ...baseConfig,
                    command: 'node',
                    args: [path.join(outPath, 'mcp-servers/figma/index.js')],
                    env: {
                        FIGMA_API_KEY: server.config.apiKey || '',
                        MCP_MODE: 'stdio'
                    }
                };

            case ServiceType.Supabase:
                return {
                    ...baseConfig,
                    command: 'node',
                    args: [path.join(outPath, 'mcp-servers/supabase/index.js')],
                    env: {
                        SUPABASE_API_KEY: server.config.apiKey || '',
                        SUPABASE_PROJECT_URL: server.config.projectUrl || '',
                        MCP_MODE: 'stdio'
                    }
                };

            case ServiceType.Vercel:
                return {
                    ...baseConfig,
                    command: 'node',
                    args: [path.join(outPath, 'mcp-servers/vercel/index.js')],
                    env: {
                        VERCEL_API_KEY: server.config.apiKey || '',
                        MCP_MODE: 'stdio'
                    }
                };

            case ServiceType.Sentry:
                return {
                    ...baseConfig,
                    command: 'node',
                    args: [path.join(outPath, 'mcp-servers/sentry/index.js')],
                    env: {
                        SENTRY_API_KEY: server.config.apiKey || '',
                        SENTRY_ORGANIZATION_SLUG: server.config.organizationSlug || '',
                        MCP_MODE: 'stdio'
                    }
                };

            case ServiceType.Taskmaster:
                return {
                    ...baseConfig,
                    command: 'node',
                    args: [path.join(outPath, 'mcp-servers/taskmaster/index.js')],
                    env: {
                        TASKMASTER_API_KEY: server.config.apiKey || '',
                        MCP_MODE: 'stdio'
                    }
                };

            case ServiceType.DesktopCommander:
                return {
                    ...baseConfig,
                    command: 'node',
                    args: [path.join(outPath, 'mcp-servers/desktop-commander/index.js')],
                    env: {
                        DESKTOP_COMMANDER_API_KEY: server.config.apiKey || '',
                        MCP_MODE: 'stdio'
                    }
                };

            case ServiceType.Dev21:
                return {
                    ...baseConfig,
                    command: 'node',
                    args: [path.join(outPath, 'mcp-servers/21st-dev/index.js')],
                    env: {
                        DEV21_API_KEY: server.config.apiKey || '',
                        MCP_MODE: 'stdio'
                    }
                };

            default:
                return baseConfig;
        }
    }

    private async writeClineSettings(settings: ClineMcpSettings): Promise<void> {
        try {
            // Ensure directory exists
            const dir = path.dirname(this.clineSettingsPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // Write settings with proper formatting
            const settingsContent = JSON.stringify(settings, null, 2);
            fs.writeFileSync(this.clineSettingsPath, settingsContent, 'utf8');
            
            console.log('Cline MCP settings updated successfully');
        } catch (error) {
            console.error('Failed to write Cline settings:', error);
            throw error;
        }
    }

    private updateStatusBar(): void {
        const connectedServers = this.mcpManager.getAllServers()
            .filter(s => s.status === ServerStatus.Connected)
            .length;

        if (connectedServers > 0) {
            this.statusBarItem.text = `$(plug) DevHub: ${connectedServers} MCP servers`;
            this.statusBarItem.tooltip = `${connectedServers} DevHub MCP servers available in Cline`;
            this.statusBarItem.color = '#4CAF50';
        } else {
            this.statusBarItem.text = '$(plug) DevHub: No MCP servers';
            this.statusBarItem.tooltip = 'No DevHub MCP servers connected';
            this.statusBarItem.color = undefined;
        }
    }

    public async syncAllConnectedServers(): Promise<void> {
        try {
            const connectedServers = this.mcpManager.getAllServers()
                .filter(s => s.status === ServerStatus.Connected);

            for (const server of connectedServers) {
                await this.addServerToClineSettings(server.id);
            }

            vscode.window.showInformationMessage(
                `✅ Synced ${connectedServers.length} connected servers to Cline`
            );
        } catch (error) {
            console.error('Failed to sync servers to Cline:', error);
            vscode.window.showErrorMessage(
                `Failed to sync servers to Cline: ${error}`
            );
        }
    }

    public async showClineSettingsStatus(): Promise<void> {
        try {
            let settings: ClineMcpSettings;
            try {
                const settingsContent = fs.readFileSync(this.clineSettingsPath, 'utf8');
                settings = JSON.parse(settingsContent);
            } catch (error) {
                vscode.window.showInformationMessage('Cline MCP settings file not found');
                return;
            }

            const devhubServers = Object.keys(settings.mcpServers)
                .filter(key => key.startsWith('devhub-'))
                .map(key => ({
                    name: key.replace('devhub-', ''),
                    config: settings.mcpServers[key]
                }));

            if (devhubServers.length === 0) {
                vscode.window.showInformationMessage('No DevHub MCP servers found in Cline settings');
                return;
            }

            const message = `
DevHub MCP Servers in Cline:
${devhubServers.map(server => `• ${server.name}`).join('\n')}

Total: ${devhubServers.length} servers
            `.trim();

            vscode.window.showInformationMessage(message, 'OK');

        } catch (error) {
            console.error('Failed to show Cline settings status:', error);
            vscode.window.showErrorMessage(
                `Failed to show Cline settings: ${error}`
            );
        }
    }

    public dispose(): void {
        this.statusBarItem.dispose();
    }
}
