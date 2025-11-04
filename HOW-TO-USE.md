# DevHub MCP Extension - Usage Guide

**Complete guide to using all 5 MCP servers: GitHub, MongoDB, Stripe, LemonSqueezy and Auth**

---

## 🚀 Quick Start

### Installation

1. Open VS Code
2. Press `F5` to launch Extension Development Host
3. DevHub icon will appear in Activity Bar (left sidebar)

### First Steps

1. Click DevHub icon in Activity Bar
2. You'll see 5 services: GitHub, MongoDB, Stripe, LemonSqueezy, Auth
3. Each service shows connection status (○ disconnected, ✓ connected)

---

## 📋 Table of Contents

1. [GitHub MCP Server](#github-mcp-server)
2. [MongoDB MCP Server](#mongodb-mcp-server)
3. [Stripe MCP Server](#stripe-mcp-server)
4. [LemonSqueezy MCP Server](#lemonsqueezy-mcp-server)
5. [Auth MCP Server](#auth-mcp-server)
6. [Common Commands](#common-commands)
7. [Keyboard Shortcuts](#keyboard-shortcuts)
8. [Troubleshooting](#troubleshooting)

---

## 🐙 GitHub MCP Server

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

### Connecting to GitHub

1. Sidebar → **GitHub** → Actions → **Connect**
2. Paste your token: `ghp_xxxxxxxxxxxxxxxxxxxx`
3. Press Enter
4. Icon changes to ✓ (connected)

### Using GitHub

**Command Palette (Cmd+Shift+P):**

- `DevHub: List GitHub Repositories` - Shows all your repos
- Click repo to open in browser

**Features:**

- View repository details (stars, forks, issues)
- Filter repos by name/description
- Quick browser access

**Example:**

```
Cmd+Shift+P → "DevHub: List GitHub Repositories"
→ See all your repos with stats
→ Click to open in GitHub
```

---

## 🗄️ MongoDB MCP Server

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

### Connecting to MongoDB

1. Sidebar → **MongoDB** → Actions → **Connect**
2. Enter connection string: `mongodb://localhost:27017`
3. (Optional) Enter default database name: `mydatabase`
4. Press Enter
5. Icon changes to ✓ (connected)

### Using MongoDB

**Command Palette:**

- `DevHub: List MongoDB Databases` - Shows all databases
- `DevHub: List Collections` - Shows collections in a database

**Features:**

- Database statistics (size, count)
- Collection management
- Connection health monitoring

---

## 💳 Stripe MCP Server

### Prerequisites

- Stripe account
- API Secret Key

### Getting Your Stripe API Key

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy "Secret key" (starts with `sk_test_` for test mode)
3. **Never use live keys during development!**

### Connecting to Stripe

1. Sidebar → **Stripe** → Actions → **Connect**
2. Paste API key: `sk_test_xxxxxxxxxxxxxxxxxxxx`
3. Press Enter
4. Icon changes to ✓ (connected)

### Using Stripe

**Command Palette:**

- `DevHub: List Stripe Customers` - View customer list
- `DevHub: List Charges` - View payment history
- `DevHub: List Subscriptions` - View active subscriptions

**Features:**

- Customer management
- Payment tracking
- Subscription monitoring
- Balance overview

**Example Data Shown:**

```
Customer: john@example.com
Balance: $0.00
Payments: 5 successful
Subscriptions: 2 active
```

---

## 🍋 LemonSqueezy MCP Server

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

### Connecting to LemonSqueezy

1. Sidebar → **LemonSqueezy** → Actions → **Connect**
2. Paste API key
3. Press Enter
4. Icon changes to ✓ (connected)

### Using LemonSqueezy

**Command Palette:**

- `DevHub: List LemonSqueezy Products` - View products
- `DevHub: List Orders` - View order history
- `DevHub: List Subscriptions` - View subscriptions

**Note:** Most commands require Store ID as parameter

**Features:**

- Product catalog
- Order management
- Subscription tracking
- Revenue overview

---

## 🔐 Auth MCP Server

### Prerequisites

- Auth API key (for your authentication service)

### Connecting to Auth

1. Sidebar → **Auth** → Actions → **Connect**
2. Enter API key (minimum 10 characters)
3. Press Enter
4. Icon changes to ✓ (connected)

### Using Auth

**Command Palette:**

- `DevHub: List OAuth Providers` - View configured providers
- `DevHub: Validate Token` - Test token validity
- `DevHub: Revoke Token` - Invalidate token

**Supported Providers:**

- ✅ GitHub OAuth (enabled)
- Google OAuth (planned)
- Microsoft OAuth (planned)
- Apple OAuth (planned)

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
- Filter by service name (e.g., "GitHub", "Stripe")

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

### GitHub Connection Issues

**Problem:** "GitHub connection failed"
**Solutions:**

1. Check token format (starts with `ghp_`)
2. Verify token has `repo` scope
3. Token might be expired - generate new one
4. Check internet connection

---

### MongoDB Connection Issues

**Problem:** "Failed to connect to MongoDB"
**Solutions:**

1. Verify connection string format
2. Check MongoDB is running (local)
3. Verify credentials (Atlas)
4. Check firewall/network settings
5. Test with: `mongodb://localhost:27017`

---

### Stripe Connection Issues

**Problem:** "Stripe API error"
**Solutions:**

1. Verify API key format (starts with `sk_`)
2. Use test key for development (`sk_test_`)
3. Never use live keys in development
4. Check Stripe dashboard for API status

---

### LemonSqueezy Connection Issues

**Problem:** "LemonSqueezy connection failed"
**Solutions:**

1. Verify API key is correct
2. API key must be at least 10 characters
3. Check LemonSqueezy API status
4. Ensure store ID is correct when listing data

---

### Auth Connection Issues

**Problem:** "Auth initialization failed"
**Solutions:**

1. API key must be at least 10 characters
2. Verify API key is active
3. Check authentication service status

---

### General Issues

**Problem:** Extension not loading
**Solutions:**

1. Press F5 to reload Extension Development Host
2. Check Debug Console for errors
3. Run `npm run compile` to recompile

**Problem:** Commands not appearing
**Solutions:**

1. Press `Cmd+Shift+P` and reload window
2. Check package.json has all commands registered
3. Restart VS Code

**Problem:** All services show disconnected
**Solutions:**

1. Click Refresh icon in sidebar
2. Use `Ctrl+Shift+R` keyboard shortcut
3. Reconnect to each service

---

## 💡 Tips & Best Practices

### Security

- ✅ Always use test/development keys
- ✅ Never commit API keys to Git
- ✅ Use `.env` files for keys (add to .gitignore)
- ✅ Rotate keys regularly
- ❌ Never use production keys in development

### Performance

- Connect only to services you're actively using
- Disconnect when done to free resources
- Use `Refresh Services` to update status

### Workflow

1. Connect to service
2. Use Command Palette for operations
3. View results in QuickPick or Dashboard
4. Disconnect when finished

---

## 🎯 Use Cases

### Scenario 1: Managing GitHub Repos

```
Connect to GitHub
Cmd+Shift+P → "List GitHub Repositories"
Browse repos with stats
Click to open in browser
```

### Scenario 2: Monitoring Stripe Payments

```
Connect to Stripe
Cmd+Shift+P → "List Stripe Charges"
View recent payments
Check customer details
```

### Scenario 3: Checking MongoDB Data

```
Connect to MongoDB
Cmd+Shift+P → "List MongoDB Databases"
View database sizes
List collections in database
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

---

## 🚀 Next Steps

After mastering the basics:

1. Explore all commands in Command Palette
2. Try Dashboard view for visual overview
3. Use keyboard shortcuts for speed
4. Integrate with your workflow
5. Provide feedback for improvements

---

**Happy coding with DevHub! 🎉**
