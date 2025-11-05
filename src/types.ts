import * as vscode from 'vscode';

export enum ServerStatus {
  Connecting = 'connecting',
  Connected = 'connected',
  Disconnected = 'disconnected',
  Error = 'error'
}

export enum ServiceType {
  GitHub = 'github',
  MongoDB = 'mongodb',
  Auth = 'auth',
  Stripe = 'stripe',
  LemonSqueezy = 'lemonsqueezy',
  Context7 = 'context7',
  SequentialThinking = 'sequential-thinking',
  Firecrawl = 'firecrawl',
  FileSystem = 'filesystem',
  Browser = 'browser',
  Figma = 'figma',
  Supabase = 'supabase',
  Vercel = 'vercel',
  Sentry = 'sentry',
  Taskmaster = 'taskmaster',
  DesktopCommander = 'desktop-commander',
  Dev21 = '21st-dev'
}

export interface McpServer {
  id: string;
  name: string;
  type: ServiceType;
  status: ServerStatus;
  config: Record<string, any>;
  lastConnected?: Date;
  error?: string;
}

export interface McpServerConfig {
  [ServiceType.GitHub]: {
    token?: string;
    apiUrl?: string;
  };
  [ServiceType.MongoDB]: {
    connectionString?: string;
    database?: string;
  };
  [ServiceType.Auth]: {
    provider?: string;
    clientId?: string;
    clientSecret?: string;
  };
  [ServiceType.Stripe]: {
    apiKey?: string;
    webhookSecret?: string;
  };
  [ServiceType.LemonSqueezy]: {
    apiKey?: string;
    storeId?: string;
  };
}

export interface DevHubState {
  servers: McpServer[];
  activeServer?: string;
  isConnecting: boolean;
}

export interface TreeItemData {
  id: string;
  label: string;
  tooltip?: string;
  collapsibleState?: vscode.TreeItemCollapsibleState;
  command?: vscode.Command;
  iconPath?: string | vscode.Uri | { light: string | vscode.Uri; dark: string | vscode.Uri };
  contextValue?: string;
}

export interface WebViewMessage {
  type: string;
  data?: any;
}

export interface ClineIntegration {
  enabled: boolean;
  serverUrl?: string;
  apiKey?: string;
}
