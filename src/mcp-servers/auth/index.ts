#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { AuthMcpServer } from './authServer';

const server = new Server(
  {
    name: 'devhub-auth-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const authServer = new AuthMcpServer();

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_providers',
        description: 'List all OAuth providers',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_provider_info',
        description: 'Get information about a specific OAuth provider',
        inputSchema: {
          type: 'object',
          properties: {
            provider: {
              type: 'string',
              description: 'OAuth provider name (github, google, etc.)',
            },
          },
          required: ['provider'],
        },
      },
      {
        name: 'create_oauth_url',
        description: 'Create OAuth authorization URL',
        inputSchema: {
          type: 'object',
          properties: {
            provider: {
              type: 'string',
              description: 'OAuth provider name',
            },
            clientId: {
              type: 'string',
              description: 'OAuth client ID',
            },
            redirectUri: {
              type: 'string',
              description: 'OAuth redirect URI',
            },
            scopes: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'OAuth scopes',
            },
          },
          required: ['provider', 'clientId', 'redirectUri'],
        },
      },
      {
        name: 'exchange_code',
        description: 'Exchange authorization code for access token',
        inputSchema: {
          type: 'object',
          properties: {
            provider: {
              type: 'string',
              description: 'OAuth provider name',
            },
            code: {
              type: 'string',
              description: 'Authorization code',
            },
            clientId: {
              type: 'string',
              description: 'OAuth client ID',
            },
            clientSecret: {
              type: 'string',
              description: 'OAuth client secret',
            },
            redirectUri: {
              type: 'string',
              description: 'OAuth redirect URI',
            },
          },
          required: ['provider', 'code', 'clientId', 'clientSecret', 'redirectUri'],
        },
      },
      {
        name: 'refresh_token',
        description: 'Refresh access token using refresh token',
        inputSchema: {
          type: 'object',
          properties: {
            provider: {
              type: 'string',
              description: 'OAuth provider name',
            },
            refreshToken: {
              type: 'string',
              description: 'Refresh token',
            },
            clientId: {
              type: 'string',
              description: 'OAuth client ID',
            },
            clientSecret: {
              type: 'string',
              description: 'OAuth client secret',
            },
          },
          required: ['provider', 'refreshToken', 'clientId', 'clientSecret'],
        },
      },
      {
        name: 'validate_token',
        description: 'Validate access token',
        inputSchema: {
          type: 'object',
          properties: {
            provider: {
              type: 'string',
              description: 'OAuth provider name',
            },
            accessToken: {
              type: 'string',
              description: 'Access token to validate',
            },
          },
          required: ['provider', 'accessToken'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Get API key from environment
    const apiKey = process.env.AUTH_API_KEY;
    if (!apiKey) {
      throw new McpError(
        ErrorCode.InternalError,
        'AUTH_API_KEY environment variable is required'
      );
    }

    // Connect to Auth service if not already connected
    if (!authServer.getConnectionStatus()) {
      const connected = await authServer.connect(apiKey);
      if (!connected) {
        throw new McpError(
          ErrorCode.InternalError,
          'Failed to connect to Auth service'
        );
      }
    }

    switch (name) {
      case 'list_providers': {
        const providers = await authServer.getProviders();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(providers, null, 2),
            },
          ],
        };
      }

      case 'get_provider_info': {
        if (!args?.provider) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'provider is required'
          );
        }
        const info = await authServer.getProviders();
        const providerInfo = info.find((p: any) => p.name === args.provider);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(providerInfo, null, 2),
            },
          ],
        };
      }

      case 'create_oauth_url': {
        if (!args?.provider || !args?.clientId || !args?.redirectUri) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'provider, clientId, and redirectUri are required'
          );
        }
        // Simulate OAuth URL creation
        const oauthUrl = {
          url: `https://${args.provider}.com/oauth/authorize?client_id=${args.clientId}&redirect_uri=${encodeURIComponent(args.redirectUri)}&response_type=code`,
          provider: args.provider,
          scopes: args?.scopes || []
        };
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(oauthUrl, null, 2),
            },
          ],
        };
      }

      case 'exchange_code': {
        if (!args?.provider || !args?.code || !args?.clientId || !args?.clientSecret || !args?.redirectUri) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'provider, code, clientId, clientSecret, and redirectUri are required'
          );
        }
        // Simulate token exchange
        const tokens = {
          access_token: 'mock_access_token_' + Date.now(),
          refresh_token: 'mock_refresh_token_' + Date.now(),
          token_type: 'Bearer',
          expires_in: 3600
        };
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(tokens, null, 2),
            },
          ],
        };
      }

      case 'refresh_token': {
        if (!args?.provider || !args?.refreshToken || !args?.clientId || !args?.clientSecret) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'provider, refreshToken, clientId, and clientSecret are required'
          );
        }
        // Simulate token refresh
        const tokens = {
          access_token: 'mock_new_access_token_' + Date.now(),
          refresh_token: 'mock_new_refresh_token_' + Date.now(),
          token_type: 'Bearer',
          expires_in: 3600
        };
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(tokens, null, 2),
            },
          ],
        };
      }

      case 'validate_token': {
        if (!args?.provider || !args?.accessToken) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'provider and accessToken are required'
          );
        }
        const validation = await authServer.validateToken(args.accessToken);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(validation, null, 2),
            },
          ],
        };
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    console.error(`Error executing tool ${name}:`, error);
    throw new McpError(
      ErrorCode.InternalError,
      `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
});

// Start server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('DevHub Auth MCP server running on stdio');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();

export { AuthMcpServer } from './authServer';
export type { AuthConfig, AuthProvider } from './authServer';
