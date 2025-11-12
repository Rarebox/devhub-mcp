#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { LemonSqueezyMcpServer } from './lemonsqueezyServer';

const server = new Server(
  {
    name: 'devhub-lemonsqueezy-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const lemonsqueezyServer = new LemonSqueezyMcpServer();

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_products',
        description: 'List all products',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of products to return',
              default: 10,
            },
          },
        },
      },
      {
        name: 'get_product',
        description: 'Get product by ID',
        inputSchema: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              description: 'Product ID',
            },
          },
          required: ['productId'],
        },
      },
      {
        name: 'list_orders',
        description: 'List all orders',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of orders to return',
              default: 10,
            },
            status: {
              type: 'string',
              description: 'Filter by order status',
            },
          },
        },
      },
      {
        name: 'get_order',
        description: 'Get order by ID',
        inputSchema: {
          type: 'object',
          properties: {
            orderId: {
              type: 'string',
              description: 'Order ID',
            },
          },
          required: ['orderId'],
        },
      },
      {
        name: 'list_customers',
        description: 'List all customers',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of customers to return',
              default: 10,
            },
          },
        },
      },
      {
        name: 'get_customer',
        description: 'Get customer by ID',
        inputSchema: {
          type: 'object',
          properties: {
            customerId: {
              type: 'string',
              description: 'Customer ID',
            },
          },
          required: ['customerId'],
        },
      },
      {
        name: 'create_checkout',
        description: 'Create a checkout session',
        inputSchema: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              description: 'Product ID',
            },
            customerEmail: {
              type: 'string',
              description: 'Customer email',
            },
            variantId: {
              type: 'string',
              description: 'Product variant ID',
            },
          },
          required: ['productId'],
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
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    if (!apiKey) {
      throw new McpError(
        ErrorCode.InternalError,
        'LEMONSQUEEZY_API_KEY environment variable is required'
      );
    }

    // Connect to LemonSqueezy if not already connected
    if (!lemonsqueezyServer.getConnectionStatus()) {
      const connected = await lemonsqueezyServer.connect(apiKey);
      if (!connected) {
        throw new McpError(
          ErrorCode.InternalError,
          'Failed to connect to LemonSqueezy'
        );
      }
    }

    switch (name) {
      case 'list_products': {
        const products = await lemonsqueezyServer.listProducts(args?.limit as number);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(products, null, 2),
            },
          ],
        };
      }

      case 'get_product': {
        if (!args?.productId) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'productId is required'
          );
        }
        const product = await lemonsqueezyServer.getProduct(args.productId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(product, null, 2),
            },
          ],
        };
      }

      case 'list_orders': {
        const orders = await lemonsqueezyServer.listOrders(args?.limit as number, args?.status as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(orders, null, 2),
            },
          ],
        };
      }

      case 'get_order': {
        if (!args?.orderId) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'orderId is required'
          );
        }
        const order = await lemonsqueezyServer.getOrder(args.orderId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(order, null, 2),
            },
          ],
        };
      }

      case 'list_customers': {
        const customers = await lemonsqueezyServer.listCustomers(args?.limit as number);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(customers, null, 2),
            },
          ],
        };
      }

      case 'get_customer': {
        if (!args?.customerId) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'customerId is required'
          );
        }
        const customer = await lemonsqueezyServer.getCustomer(args.customerId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(customer, null, 2),
            },
          ],
        };
      }

      case 'create_checkout': {
        if (!args?.productId) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'productId is required'
          );
        }
        const checkout = await lemonsqueezyServer.createCheckout(
          args.productId,
          args?.customerEmail,
          args?.variantId
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(checkout, null, 2),
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
    console.error('DevHub LemonSqueezy MCP server running on stdio');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();

export { LemonSqueezyMcpServer } from './lemonsqueezyServer';
export type { LemonSqueezyConfig, LemonSqueezyProduct, LemonSqueezyOrder, LemonSqueezyCustomer } from './lemonsqueezyServer';
