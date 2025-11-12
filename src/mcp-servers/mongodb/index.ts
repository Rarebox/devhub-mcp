#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { MongoDBMcpServer } from './mongodbServer';

const server = new Server(
  {
    name: 'devhub-mongodb-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const mongodbServer = new MongoDBMcpServer();

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_databases',
        description: 'List all databases in MongoDB',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_database_info',
        description: 'Get detailed information about a specific database',
        inputSchema: {
          type: 'object',
          properties: {
            databaseName: {
              type: 'string',
              description: 'Database name',
            },
          },
          required: ['databaseName'],
        },
      },
      {
        name: 'list_collections',
        description: 'List all collections in a database',
        inputSchema: {
          type: 'object',
          properties: {
            databaseName: {
              type: 'string',
              description: 'Database name',
            },
          },
          required: ['databaseName'],
        },
      },
      {
        name: 'get_collection_stats',
        description: 'Get statistics for a collection',
        inputSchema: {
          type: 'object',
          properties: {
            databaseName: {
              type: 'string',
              description: 'Database name',
            },
            collectionName: {
              type: 'string',
              description: 'Collection name',
            },
          },
          required: ['databaseName', 'collectionName'],
        },
      },
      {
        name: 'execute_query',
        description: 'Execute a MongoDB query',
        inputSchema: {
          type: 'object',
          properties: {
            databaseName: {
              type: 'string',
              description: 'Database name',
            },
            collectionName: {
              type: 'string',
              description: 'Collection name',
            },
            query: {
              type: 'object',
              description: 'MongoDB query object',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of documents to return',
              default: 10,
            },
          },
          required: ['databaseName', 'collectionName', 'query'],
        },
      },
      {
        name: 'insert_document',
        description: 'Insert a document into a collection',
        inputSchema: {
          type: 'object',
          properties: {
            databaseName: {
              type: 'string',
              description: 'Database name',
            },
            collectionName: {
              type: 'string',
              description: 'Collection name',
            },
            document: {
              type: 'object',
              description: 'Document to insert',
            },
          },
          required: ['databaseName', 'collectionName', 'document'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Get connection string from environment
    const connectionString = process.env.MONGODB_CONNECTION_STRING;
    if (!connectionString) {
      throw new McpError(
        ErrorCode.InternalError,
        'MONGODB_CONNECTION_STRING environment variable is required'
      );
    }

    // Connect to MongoDB if not already connected
    if (!mongodbServer.getConnectionStatus()) {
      const connected = await mongodbServer.connect(connectionString);
      if (!connected) {
        throw new McpError(
          ErrorCode.InternalError,
          'Failed to connect to MongoDB'
        );
      }
    }

    switch (name) {
      case 'list_databases': {
        const databases = await mongodbServer.listDatabases();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(databases, null, 2),
            },
          ],
        };
      }

      case 'get_database_info': {
        if (!args?.databaseName) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'databaseName is required'
          );
        }
        const info = await mongodbServer.getDatabaseInfo(args.databaseName);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(info, null, 2),
            },
          ],
        };
      }

      case 'list_collections': {
        if (!args?.databaseName) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'databaseName is required'
          );
        }
        const collections = await mongodbServer.listCollections(args.databaseName);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(collections, null, 2),
            },
          ],
        };
      }

      case 'get_collection_stats': {
        if (!args?.databaseName || !args?.collectionName) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'databaseName and collectionName are required'
          );
        }
        const stats = await mongodbServer.getCollectionStats(args.databaseName, args.collectionName);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(stats, null, 2),
            },
          ],
        };
      }

      case 'execute_query': {
        if (!args?.databaseName || !args?.collectionName || !args?.query) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'databaseName, collectionName, and query are required'
          );
        }
        const results = await mongodbServer.executeQuery(
          args.databaseName,
          args.collectionName,
          args.query,
          args?.limit
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      case 'insert_document': {
        if (!args?.databaseName || !args?.collectionName || !args?.document) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'databaseName, collectionName, and document are required'
          );
        }
        const result = await mongodbServer.insertDocument(
          args.databaseName,
          args.collectionName,
          args.document
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
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
    console.error('DevHub MongoDB MCP server running on stdio');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();

export { MongoDBMcpServer } from './mongodbServer';
export type { MongoDBConfig, MongoDBDatabase, MongoDBCollection, MongoDBStats } from './mongodbServer';
