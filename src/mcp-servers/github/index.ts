#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { GitHubMcpServer } from './githubServer';

const server = new Server(
  {
    name: 'devhub-github-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const githubServer = new GitHubMcpServer();

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_github_repositories',
        description: 'List GitHub repositories for the authenticated user',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description: 'Type of repositories to list (all, owner, member)',
              enum: ['all', 'owner', 'member'],
              default: 'all',
            },
            sort: {
              type: 'string',
              description: 'Sort order (created, updated, pushed, full_name)',
              enum: ['created', 'updated', 'pushed', 'full_name'],
              default: 'updated',
            },
            per_page: {
              type: 'number',
              description: 'Number of results per page (max 100)',
              default: 30,
            },
          },
        },
      },
      {
        name: 'get_repository',
        description: 'Get detailed information about a specific repository',
        inputSchema: {
          type: 'object',
          properties: {
            owner: {
              type: 'string',
              description: 'Repository owner',
            },
            repo: {
              type: 'string',
              description: 'Repository name',
            },
          },
          required: ['owner', 'repo'],
        },
      },
      {
        name: 'list_pull_requests',
        description: 'List pull requests for a repository',
        inputSchema: {
          type: 'object',
          properties: {
            owner: {
              type: 'string',
              description: 'Repository owner',
            },
            repo: {
              type: 'string',
              description: 'Repository name',
            },
            state: {
              type: 'string',
              description: 'State of pull requests (open, closed, all)',
              enum: ['open', 'closed', 'all'],
              default: 'open',
            },
          },
          required: ['owner', 'repo'],
        },
      },
      {
        name: 'create_pull_request',
        description: 'Create a new pull request',
        inputSchema: {
          type: 'object',
          properties: {
            owner: {
              type: 'string',
              description: 'Repository owner',
            },
            repo: {
              type: 'string',
              description: 'Repository name',
            },
            title: {
              type: 'string',
              description: 'Pull request title',
            },
            head: {
              type: 'string',
              description: 'The name of the branch where your changes are implemented',
            },
            base: {
              type: 'string',
              description: 'The name of the branch you want the changes pulled into',
            },
            body: {
              type: 'string',
              description: 'The contents of the pull request',
            },
          },
          required: ['owner', 'repo', 'title', 'head', 'base'],
        },
      },
      {
        name: 'list_issues',
        description: 'List issues for a repository',
        inputSchema: {
          type: 'object',
          properties: {
            owner: {
              type: 'string',
              description: 'Repository owner',
            },
            repo: {
              type: 'string',
              description: 'Repository name',
            },
            state: {
              type: 'string',
              description: 'State of issues (open, closed, all)',
              enum: ['open', 'closed', 'all'],
              default: 'open',
            },
          },
          required: ['owner', 'repo'],
        },
      },
      {
        name: 'create_issue',
        description: 'Create a new issue',
        inputSchema: {
          type: 'object',
          properties: {
            owner: {
              type: 'string',
              description: 'Repository owner',
            },
            repo: {
              type: 'string',
              description: 'Repository name',
            },
            title: {
              type: 'string',
              description: 'Issue title',
            },
            body: {
              type: 'string',
              description: 'Issue body/description',
            },
          },
          required: ['owner', 'repo', 'title'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Get token from environment
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new McpError(
        ErrorCode.InternalError,
        'GITHUB_TOKEN environment variable is required'
      );
    }

    // Connect to GitHub if not already connected
    if (!githubServer.getConnectionStatus()) {
      const connected = await githubServer.connect(token);
      if (!connected) {
        throw new McpError(
          ErrorCode.InternalError,
          'Failed to connect to GitHub'
        );
      }
    }

    switch (name) {
      case 'list_github_repositories': {
        const repos = await githubServer.listRepositories(args?.type as string, args?.sort as string, args?.per_page as number);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(repos, null, 2),
            },
          ],
        };
      }

      case 'get_repository': {
        if (!args?.owner || !args?.repo) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'owner and repo are required'
          );
        }
        const repo = await githubServer.getRepository(args.owner as string, args.repo as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(repo, null, 2),
            },
          ],
        };
      }

      case 'list_pull_requests': {
        if (!args?.owner || !args?.repo) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'owner and repo are required'
          );
        }
        const prs = await githubServer.listPullRequests(args.owner as string, args.repo as string, args?.state as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(prs, null, 2),
            },
          ],
        };
      }

      case 'create_pull_request': {
        if (!args?.owner || !args?.repo || !args?.title || !args?.head || !args?.base) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'owner, repo, title, head, and base are required'
          );
        }
        const pr = await githubServer.createPullRequest(
          args.owner as string,
          args.repo as string,
          args.title as string,
          args.head as string,
          args.base as string,
          args?.body as string
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(pr, null, 2),
            },
          ],
        };
      }

      case 'list_issues': {
        if (!args?.owner || !args?.repo) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'owner and repo are required'
          );
        }
        const issues = await githubServer.listIssues(args.owner as string, args.repo as string, args?.state as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(issues, null, 2),
            },
          ],
        };
      }

      case 'create_issue': {
        if (!args?.owner || !args?.repo || !args?.title) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'owner, repo, and title are required'
          );
        }
        const issue = await githubServer.createIssue(
          args.owner as string,
          args.repo as string,
          args.title as string,
          args?.body as string
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(issue, null, 2),
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
    console.error('DevHub GitHub MCP server running on stdio');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();

export { GitHubMcpServer } from './githubServer';
export type { GitHubConfig, GitHubRepository, GitHubPullRequest } from './githubServer';
