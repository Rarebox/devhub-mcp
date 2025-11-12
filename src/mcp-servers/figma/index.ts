#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { FigmaMcpServer } from './figmaServer';

const server = new Server(
  {
    name: 'devhub-figma-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const figmaServer = new FigmaMcpServer();

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_figma_files',
        description: 'List all Figma files',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_file_frames',
        description: 'Get frames from a Figma file',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: {
              type: 'string',
              description: 'Figma file ID',
            },
          },
          required: ['fileId'],
        },
      },
      {
        name: 'get_frame_elements',
        description: 'Get elements from a specific frame',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: {
              type: 'string',
              description: 'Figma file ID',
            },
            frameId: {
              type: 'string',
              description: 'Frame ID',
            },
          },
          required: ['fileId', 'frameId'],
        },
      },
      {
        name: 'list_components',
        description: 'List components in a Figma file',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: {
              type: 'string',
              description: 'Figma file ID',
            },
          },
          required: ['fileId'],
        },
      },
      {
        name: 'get_design_specs',
        description: 'Get design specifications from a Figma file',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: {
              type: 'string',
              description: 'Figma file ID',
            },
          },
          required: ['fileId'],
        },
      },
      {
        name: 'generate_component_code',
        description: 'Generate code from a Figma component',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: {
              type: 'string',
              description: 'Figma file ID',
            },
            componentId: {
              type: 'string',
              description: 'Component ID',
            },
            framework: {
              type: 'string',
              description: 'Target framework (react, vue, etc.)',
              enum: ['react', 'vue', 'html'],
              default: 'react',
            },
          },
          required: ['fileId', 'componentId'],
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
    const apiKey = process.env.FIGMA_API_KEY;
    if (!apiKey) {
      throw new McpError(
        ErrorCode.InternalError,
        'FIGMA_API_KEY environment variable is required'
      );
    }

    // Connect to Figma if not already connected
    if (!figmaServer.getConnectionStatus()) {
      const connected = await figmaServer.connect(apiKey);
      if (!connected) {
        throw new McpError(
          ErrorCode.InternalError,
          'Failed to connect to Figma'
        );
      }
    }

    switch (name) {
      case 'list_figma_files': {
        const files = await figmaServer.listFiles();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(files, null, 2),
            },
          ],
        };
      }

      case 'get_file_frames': {
        if (!args?.fileId) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'fileId is required'
          );
        }
        const frames = await figmaServer.getFileFrames(args.fileId as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(frames, null, 2),
            },
          ],
        };
      }

      case 'get_frame_elements': {
        if (!args?.fileId || !args?.frameId) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'fileId and frameId are required'
          );
        }
        const elements = await figmaServer.getFrameElements(
          args.fileId as string,
          args.frameId as string
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(elements, null, 2),
            },
          ],
        };
      }

      case 'list_components': {
        if (!args?.fileId) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'fileId is required'
          );
        }
        const components = await figmaServer.listComponents(args.fileId as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(components, null, 2),
            },
          ],
        };
      }

      case 'get_design_specs': {
        if (!args?.fileId) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'fileId is required'
          );
        }
        const specs = await figmaServer.getDesignSpecs(args.fileId as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(specs, null, 2),
            },
          ],
        };
      }

      case 'generate_component_code': {
        if (!args?.fileId || !args?.componentId) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'fileId and componentId are required'
          );
        }
        const code = await figmaServer.generateComponentCode(
          args.fileId as string,
          args.componentId as string,
          (args?.framework as string) || 'react'
        );
        return {
          content: [
            {
              type: 'text',
              text: code,
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

// Start the server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('DevHub Figma MCP server running on stdio');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();

export { FigmaMcpServer } from './figmaServer';
export type { 
    FigmaConfig, 
    FigmaFile, 
    FigmaComponent, 
    FigmaFrame, 
    FigmaElement, 
    DesignSpecs 
} from './figmaServer';
