import * as vscode from 'vscode';

export enum ServerStatus {
  Connected = 'connected',
  Disconnected = 'disconnected',
  Error = 'error'
}

export enum ServiceType {
  GitHub = 'github',
  MongoDB = 'mongodb',
  Auth = 'auth',
  Stripe = 'stripe',
  LemonSqueezy = 'lemonsqueezy'
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
