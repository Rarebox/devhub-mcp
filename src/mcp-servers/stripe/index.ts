#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { StripeMcpServer } from './stripeServer';

const server = new Server(
  {
    name: 'devhub-stripe-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const stripeServer = new StripeMcpServer();

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
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
        name: 'create_customer',
        description: 'Create a new customer',
        inputSchema: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              description: 'Customer email',
            },
            name: {
              type: 'string',
              description: 'Customer name',
            },
            description: {
              type: 'string',
              description: 'Customer description',
            },
          },
          required: ['email'],
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
        name: 'list_charges',
        description: 'List all charges',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of charges to return',
              default: 10,
            },
            customerId: {
              type: 'string',
              description: 'Filter by customer ID',
            },
          },
        },
      },
      {
        name: 'create_charge',
        description: 'Create a new charge',
        inputSchema: {
          type: 'object',
          properties: {
            amount: {
              type: 'number',
              description: 'Amount in cents',
            },
            currency: {
              type: 'string',
              description: 'Currency code (e.g., usd)',
              default: 'usd',
            },
            source: {
              type: 'string',
              description: 'Payment source ID',
            },
            description: {
              type: 'string',
              description: 'Charge description',
            },
            customerId: {
              type: 'string',
              description: 'Customer ID',
            },
          },
          required: ['amount'],
        },
      },
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
        name: 'create_product',
        description: 'Create a new product',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Product name',
            },
            description: {
              type: 'string',
              description: 'Product description',
            },
            price: {
              type: 'number',
              description: 'Price in cents',
            },
            currency: {
              type: 'string',
              description: 'Currency code (e.g., usd)',
              default: 'usd',
            },
          },
          required: ['name'],
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
    const apiKey = process.env.STRIPE_API_KEY;
    if (!apiKey) {
      throw new McpError(
        ErrorCode.InternalError,
        'STRIPE_API_KEY environment variable is required'
      );
    }

    // Connect to Stripe if not already connected
    if (!stripeServer.getConnectionStatus()) {
      const connected = await stripeServer.connect(apiKey);
      if (!connected) {
        throw new McpError(
          ErrorCode.InternalError,
          'Failed to connect to Stripe'
        );
      }
    }

    switch (name) {
      case 'list_customers': {
        const customers = await stripeServer.listCustomers(args?.limit as number);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(customers, null, 2),
            },
          ],
        };
      }

      case 'create_customer': {
        if (!args?.email) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'email is required'
          );
        }
        const customer = await stripeServer.createCustomer(
          args.email as string,
          args?.name as string,
          args?.description as string
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(customer, null, 2),
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
        const customer = await stripeServer.getCustomer(args.customerId as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(customer, null, 2),
            },
          ],
        };
      }

      case 'list_charges': {
        const charges = await stripeServer.listCharges();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(charges, null, 2),
            },
          ],
        };
      }

      case 'create_charge': {
        if (!args?.amount || !args?.currency || !args?.source) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'amount, currency, and source are required'
          );
        }
        const charge = await stripeServer.createCharge(
          args.amount as number,
          args.currency as string,
          args.source as string,
          args?.description as string
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(charge, null, 2),
            },
          ],
        };
      }

      case 'create_product': {
        if (!args?.name) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'name is required'
          );
        }
        const product = await stripeServer.createProduct(
          args.name as string,
          args?.description as string
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(product, null, 2),
            },
          ],
        };
      }

      case 'list_products': {
        const products = await stripeServer.listProducts(args?.limit as number);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(products, null, 2),
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
    console.error('DevHub Stripe MCP server running on stdio');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();

export { StripeMcpServer } from './stripeServer';
export type { StripeConfig, StripeCustomer, StripeCharge, StripeProduct } from './stripeServer';
