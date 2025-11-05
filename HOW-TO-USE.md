# DevHub MCP Extension - Complete Usage Guide

**Complete guide to using all 17 MCP servers with connection instructions, usage examples, and commands**

---

## 🚀 Quick Start

### Installation

1. Open VS Code
2. Press `F5` to launch Extension Development Host
3. DevHub icon will appear in Activity Bar (left sidebar)

### First Steps

1. Click DevHub icon in Activity Bar
2. You'll see 17 services available for connection
3. Each service shows connection status (○ disconnected, ✓ connected)

---

## 📋 Table of Contents

1. [GitHub MCP Server](#github-mcp-server) ✅
2. [MongoDB MCP Server](#mongodb-mcp-server) ✅
3. [Stripe MCP Server](#stripe-mcp-server) ✅
4. [LemonSqueezy MCP Server](#lemonsqueezy-mcp-server) ✅
5. [Auth MCP Server](#auth-mcp-server) ✅
6. [Context 7 MCP Server](#context-7-mcp-server) ✅
7. [Sequential Thinking MCP Server](#sequential-thinking-mcp-server) ✅
8. [Firecrawl MCP Server](#firecrawl-mcp-server) ✅
9. [FileSystem MCP Server](#filesystem-mcp-server) ✅
10. [Browser MCP Server](#browser-mcp-server) ✅
11. [Figma MCP Server](#figma-mcp-server) ✅
12. [Supabase MCP Server](#supabase-mcp-server) ✅
13. [Vercel MCP Server](#vercel-mcp-server) ✅
14. [Sentry MCP Server](#sentry-mcp-server) ✅
15. [Taskmaster MCP Server](#taskmaster-mcp-server) ✅
16. [Desktop Commander MCP Server](#desktop-commander-mcp-server) ✅
17. [21st Dev MCP Server](#21st-dev-mcp-server) ✅
18. [Common Commands](#common-commands)
19. [Keyboard Shortcuts](#keyboard-shortcuts)
20. [Troubleshooting](#troubleshooting)

---

## 🐙 GitHub MCP Server ✅

### Prerequisites

- GitHub account
- Personal Access Token with `repo` scope

### Getting Your GitHub Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes:
   - ✅ `repo` (Full control of repositories)
   - ✅ `read:user` (Read user profile)
   - ✅ `user:email` (Access user email)
4. Generate token
5. **Copy token** (starts with `ghp_`)

### Connection Instructions

1. Sidebar → **GitHub** → Actions → **Connect**
2. Paste your token: `ghp_xxxxxxxxxxxxxxxxxxxx`
3. Press Enter
4. Icon changes to ✓ (connected)

### Quick Examples

**Command Palette (Cmd+Shift+P):**

- `DevHub: List GitHub Repositories` - Shows all your repos
- Click repo to open in browser

**Common Commands:**

- List repositories with stars/forks
- Get repository details
- Browse repository contents
- Search repositories

---

## 🗄️ MongoDB MCP Server ✅

### Prerequisites

- MongoDB instance (local or cloud)
- Connection string

### Getting MongoDB Connection String

**Option 1: Local MongoDB**

```
mongodb://localhost:27017
```

**Option 2: MongoDB Atlas (Free)**

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free cluster
3. Click "Connect" → "Connect your application"
4. Copy connection string: `mongodb+srv://username:password@cluster.mongodb.net`

**Option 3: Docker**

```
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

Connection string: `mongodb://localhost:27017`

### Connection Instructions

1. Sidebar → **MongoDB** → Actions → **Connect**
2. Enter connection string: `mongodb://localhost:27017`
3. (Optional) Enter default database name: `mydatabase`
4. Press Enter
5. Icon changes to ✓ (connected)

### Quick Examples

**Command Palette:**

- `DevHub: List MongoDB Databases` - Shows all databases
- `DevHub: List Collections` - Shows collections in a database

**Common Commands:**

- List databases and collections
- Get collection statistics
- Query documents
- Create/update/delete operations

---

## 💳 Stripe MCP Server ✅

### Prerequisites

- Stripe account
- API Secret Key

### Getting Your Stripe API Key

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy "Secret key" (starts with `sk_test_` for test mode)
3. **Never use live keys during development!**

### Connection Instructions

1. Sidebar → **Stripe** → Actions → **Connect**
2. Paste API key: `sk_test_xxxxxxxxxxxxxxxxxxxx`
3. Press Enter
4. Icon changes to ✓ (connected)

### Quick Examples

**Command Palette:**

- `DevHub: List Stripe Customers` - View customer list
- `DevHub: List Charges` - View payment history
- `DevHub: List Subscriptions` - View active subscriptions

**Common Commands:**

- Customer management
- Payment tracking
- Subscription monitoring
- Balance overview
- Create charges/refunds

---

## 🍋 LemonSqueezy MCP Server ✅

### Prerequisites

- LemonSqueezy account
- API Key
- Store ID

### Getting Your LemonSqueezy API Key

1. Go to https://app.lemonsqueezy.com/settings/api
2. Click "Create API Key"
3. Copy key

### Getting Your Store ID

1. Go to https://app.lemonsqueezy.com/settings/stores
2. Your Store ID is in the URL: `https://app.lemonsqueezy.com/stores/{STORE_ID}`

### Connection Instructions

1. Sidebar → **LemonSqueezy** → Actions → **Connect**
2. Paste API key
3. Press Enter
4. Icon changes to ✓ (connected)

### Quick Examples

**Command Palette:**

- `DevHub: List LemonSqueezy Products` - View products
- `DevHub: List Orders` - View order history
- `DevHub: List Subscriptions` - View subscriptions

**Common Commands:**

- Product catalog management
- Order management
- Subscription tracking
- Revenue overview

---

## 🔐 Auth MCP Server ✅

### Prerequisites

- Auth API key (for your authentication service)

### Connection Instructions

1. Sidebar → **Auth** → Actions → **Connect**
2. Enter API key (minimum 10 characters)
3. Press Enter
4. Icon changes to ✓ (connected)

### Quick Examples

**Command Palette:**

- `DevHub: List OAuth Providers` - View configured providers
- `DevHub: Validate Token` - Test token validity
- `DevHub: Revoke Token` - Invalidate token

**Common Commands:**

- OAuth provider management
- Token validation
- User authentication
- Session management

---

## 🧠 Context 7 MCP Server ✅

### Prerequisites

- Context 7 API key
- Context management service

### Getting Your Context 7 API Key

1. Go to your Context 7 dashboard
2. Generate new API key
3. Copy key (starts with `ctx7_`)

### Connection Instructions

1. Sidebar → **Context 7** → Actions → **Connect**
2. Paste API key: `ctx7_xxxxxxxxxxxxxxxxxxxx`
3. Press Enter
4. Icon changes to ✓ (connected)

### Quick Examples

**Command Palette:**

- `DevHub: Store Context` - Save context data
- `DevHub: Retrieve Context` - Get stored context
- `DevHub: List Contexts` - View all contexts

**Common Commands:**

- Context storage/retrieval
- Context search
- Context management
- Context sharing

---

## 🧭 Sequential Thinking MCP Server ✅

### Prerequisites

- Sequential Thinking API key or any key for reasoning

### Getting Your Sequential Thinking API Key

1. Go to your Sequential Thinking service
2. Generate API key (starts with `st_`)
3. Or use any key for basic reasoning

### Connection Instructions

1. Sidebar → **Sequential Thinking** → Actions → **Connect**
2. Paste API key: `st_xxxxxxxxxxxxxxxxxxxx`
3. Press Enter
4. Icon changes to ✓ (connected)

### Quick Examples

**Command Palette:**

- `DevHub: Solve with Reasoning` - Structured problem solving
- `DevHub: Revise Step` - Modify reasoning steps
- `DevHub: Analyze Alternative` - Explore different approaches

**Common Commands:**

- Structured reasoning
- Step-by-step problem solving
- Alternative analysis
- Backtracking and revision

---

## 🔥 Firecrawl MCP Server ✅

### Prerequisites

- Firecrawl API key
- Firecrawl account

### Getting Your Firecrawl API Key

1. Go to https://firecrawl.dev
2. Sign up and get API key
3. Copy key (starts with `fc_`)

### Connection Instructions

1. Sidebar → **Firecrawl** → Actions → **Connect**
2. Paste API key: `fc_xxxxxxxxxxxxxxxxxxxx`
3. Press Enter
4. Icon changes to ✓ (connected)

### Quick Examples

**Command Palette:**

- `DevHub: Crawl Website` - Extract website content
- `DevHub: Scrape Page` - Get page data
- `DevHub: Search Web` - Web search with results

**Common Commands:**

- Website crawling
- Page scraping
- Web search
- Content extraction

---

## 📁 FileSystem MCP Server ✅

### Prerequisites

- File system access permissions
- Root path for access

### Connection Instructions

1. Sidebar → **FileSystem** → Actions → **Connect**
2. Enter root path (default: current working directory)
3. Press Enter
4. Icon changes to ✓ (connected)

### Quick Examples

**Command Palette:**

- `DevHub: List Directory` - Browse files
- `DevHub: Read File` - View file contents
- `DevHub: Write File` - Create/edit files

**Common Commands:**

- Directory listing
- File read/write operations
- File search
- Project structure analysis

---

## 🌐 Browser MCP Server ✅

### Prerequisites

- Browser automation permissions
- Web browser installed

### Connection Instructions

1. Sidebar → **Browser** → Actions → **Connect**
2. Icon changes to ✓ (connected) - No API key needed

### Quick Examples

**Command Palette:**

- `DevHub: Open Browser` - Launch browser
- `DevHub: Navigate to URL` - Go to website
- `DevHub: Take Screenshot` - Capture page

**Common Commands:**

- Browser automation
- Page navigation
- Screenshot capture
- Element interaction

---

## 🎨 Figma MCP Server ✅

### Prerequisites

- Figma account
- Figma Personal Access Token

### Getting Your Figma API Key

1. Go to https://www.figma.com/developers/api#access-tokens
2. Click "Generate new token"
3. Copy token

### Connection Instructions

1. Sidebar → **Figma** → Actions → **Connect**
2. Paste API key
3. Press Enter
4. Icon changes to ✓ (connected)

### Quick Examples

**Command Palette:**

- `DevHub: List Figma Files` - View design files
- `DevHub: Get Component Info` - Component details
- `DevHub: Export Design` - Export assets

**Common Commands:**

- File management
- Component inspection
- Design export
- Team collaboration

---

## 🟢 Supabase MCP Server ✅

### Prerequisites

- Supabase project
- API keys (anon and service_role)

### Getting Your Supabase API Keys

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy anon key and service_role key

### Connection Instructions

1. Sidebar → **Supabase** → Actions → **Connect**
2. Enter API keys
3. Press Enter
4. Icon changes to ✓ (connected)

### Quick Examples

**Command Palette:**

- `DevHub: List Tables` - View database tables
- `DevHub: Query Database` - Execute SQL queries
- `DevHub: Get Auth Users` - User management

**Common Commands:**

- Database operations
- Authentication management
- Storage management
- Real-time subscriptions

---

## ▲ Vercel MCP Server ✅

### Prerequisites

- Vercel account
- Vercel Access Token

### Getting Your Vercel API Key

1. Go to https://vercel.com/account/tokens
2. Click "Generate Token"
3. Copy token

### Connection Instructions

1. Sidebar → **Vercel** → Actions → **Connect**
2. Paste API key
3. Press Enter
4. Icon changes to ✓ (connected)

### Quick Examples

**Command Palette:**

- `DevHub: List Vercel Projects` - View deployments
- `DevHub: Deploy Project` - Deploy to Vercel
- `DevHub: Get Logs` - View deployment logs

**Common Commands:**

- Project management
- Deployment control
- Log access
- Domain management

---

## 🛡️ Sentry MCP Server ✅

### Prerequisites

- Sentry account
- Sentry Auth Token

### Getting Your Sentry API Key

1. Go to https://sentry.io/settings/auth-tokens
2. Create new auth token
3. Copy token

### Connection Instructions

1. Sidebar → **Sentry** → Actions → **Connect**
2. Paste API key
3. Press Enter
4. Icon changes to ✓ (connected)

### Quick Examples

**Command Palette:**

- `DevHub: List Sentry Projects` - View projects
- `DevHub: Get Issues` - Error tracking
- `DevHub: Get Events` - Event monitoring

**Common Commands:**

- Error tracking
- Issue management
- Performance monitoring
- Alert management

---

## 📋 Taskmaster MCP Server ✅

### Prerequisites

- Taskmaster API key
- Task management service

### Getting Your Taskmaster API Key

1. Go to your Taskmaster service
2. Generate API key
3. Copy key

### Connection Instructions

1. Sidebar → **Taskmaster** → Actions → **Connect**
2. Paste API key
3. Press Enter
4. Icon changes to ✓ (connected)

### Quick Examples

**Command Palette:**

- `DevHub: List Tasks` - View all tasks
- `DevHub: Create Task` - Add new task
- `DevHub: Update Task` - Modify existing task

**Common Commands:**

- Task creation/management
- Project organization
- Deadline tracking
- Team collaboration

---

## 💻 Desktop Commander MCP Server ✅

### Prerequisites

- Desktop access permissions
- System command execution rights

### Connection Instructions

1. Sidebar → **Desktop Commander** → Actions → **Connect**
2. Enter API key (if required)
3. Press Enter
4. Icon changes to ✓ (connected)

### Quick Examples

**Command Palette:**

- `DevHub: Execute Command` - Run system commands
- `DevHub: List Processes` - View running processes
- `DevHub: Get System Stats` - System monitoring

**Common Commands:**

- System command execution
- Process management
- File operations
- Application control
- System monitoring

---

## 🚀 21st Dev MCP Server ✅

### Prerequisites

- 21st Dev API key
- Autonomous development service

### Getting Your 21st Dev API Key

1. Go to your 21st Dev service
2. Generate API key
3. Copy key

### Connection Instructions

1. Sidebar → **21st Dev** → Actions → **Connect**
2. Paste API key
3. Press Enter
4. Icon changes to ✓ (connected)

### Quick Examples

**Command Palette:**

- `DevHub: Generate Code` - AI-powered code generation
- `DevHub: Generate Project Scaffold` - Project templates
- `DevHub: Generate README` - Documentation creation

**Common Commands:**

- AI code generation
- Project scaffolding
- Documentation generation
- Deployment planning
- Code management

---

## 🎮 Common Commands

### Service Management

| Command            | Shortcut                        | Description                  |
| ------------------ | ------------------------------- | ---------------------------- |
| Open Dashboard     | `Ctrl+Shift+D` / `Ctrl+Shift+O` | Open main dashboard          |
| Connect Service    | -                               | Connect to a service         |
| Disconnect Service | -                               | Disconnect from service      |
| Connect All        | -                               | Connect to all services      |
| Disconnect All     | -                               | Disconnect from all services |
| Refresh Services   | `Ctrl+Shift+R`                  | Refresh service list         |

### Command Palette Access

Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux), then type:

- `DevHub:` to see all commands
- Filter by service name (e.g., "GitHub", "Stripe", "21st Dev")

### Context Menus

Right-click any service in sidebar:

- **Connect** - Connect to service
- **Disconnect** - Disconnect from service
- **Test Connection** - Check connection health
- **Configure** - Service settings

---

## ⌨️ Keyboard Shortcuts

### Global Shortcuts

- `Ctrl+Shift+D` / `Ctrl+Shift+O` - Open Dashboard
- `Ctrl+Shift+R` - Refresh Services

### Quick Actions

- `Cmd+Shift+P` → Type command name
- Click service → Expand actions
- Right-click service → Context menu

---

## 🐛 Troubleshooting

### General Connection Issues

**Problem:** "Connection failed"
**Solutions:**

1. Verify API key format and validity
2. Check internet connection
3. Ensure service is available
4. Try reconnecting

### API Key Issues

**Problem:** "Invalid API key"
**Solutions:**

1. Check key format (prefix requirements)
2. Ensure key is not expired
3. Use correct environment (test vs production)
4. Regenerate key if needed

### Performance Issues

**Problem:** "Slow response times"
**Solutions:**

1. Connect only to needed services
2. Disconnect unused services
3. Refresh service status
4. Check system resources

### Extension Issues

**Problem:** "Extension not loading"
**Solutions:**

1. Press F5 to reload Extension Development Host
2. Check Debug Console for errors
3. Run `npm run compile` to recompile
4. Restart VS Code

---

## 💡 Tips & Best Practices

### Security

- ✅ Always use test/development keys when available
- ✅ Never commit API keys to Git
- ✅ Use `.env` files for keys (add to .gitignore)
- ✅ Rotate keys regularly
- ❌ Never use production keys in development

### Performance

- Connect only to services you're actively using
- Disconnect when done to free resources
- Use `Refresh Services` to update status
- Monitor system resource usage

### Workflow

1. Connect to required services
2. Use Command Palette for operations
3. View results in QuickPick or Dashboard
4. Disconnect when finished
5. Save frequently used configurations

---

## 🎯 Use Cases

### Scenario 1: Full-Stack Development

```
Connect to: GitHub, MongoDB, 21st Dev
Generate project scaffold with 21st Dev
Clone repository with GitHub
Set up database with MongoDB
Generate code components with 21st Dev
```

### Scenario 2: Deployment Pipeline

```
Connect to: Vercel, Sentry, 21st Dev
Generate deployment plan with 21st Dev
Deploy to Vercel
Monitor with Sentry
Track deployment status
```

### Scenario 3: Design & Development

```
Connect to: Figma, Browser, FileSystem
Export designs from Figma
Automate browser testing
Manage project files locally
```

### Scenario 4: System Administration

```
Connect to: Desktop Commander, Taskmaster
Execute system commands
Manage running processes
Monitor system resources
Automate administrative tasks
```

---

## 📞 Support

### Getting Help

- Check Debug Console for errors
- Review logs in Extension Development Host
- File issues on GitHub repository
- Check documentation in README.md

### Reporting Bugs

Include:

- VS Code version
- Extension version
- Error message from Debug Console
- Steps to reproduce
- Which services are affected

---

## 🚀 Next Steps

After mastering the basics:

1. Explore all commands in Command Palette
2. Try Dashboard view for visual overview
3. Use keyboard shortcuts for speed
4. Integrate with your development workflow
5. Combine multiple services for complex tasks
6. Provide feedback for improvements

---

**Happy coding with DevHub! 🎉**

**17 MCP Servers - Complete Development Ecosystem** 🌟
