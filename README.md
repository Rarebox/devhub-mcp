# DevHub - Multi-Service Dashboard

**Manage 17 developer services from one place**

A comprehensive VS Code extension that provides a unified dashboard for managing multiple developer services through MCP (Model Context Protocol) integration.

## 🚀 Features

- **17 Integrated Services**: GitHub, MongoDB, Auth, Stripe, LemonSqueezy, Context 7, Sequential Thinking, Firecrawl, FileSystem, Browser, Figma, Supabase, Vercel, Sentry, Taskmaster, Desktop Commander, 21st Dev
- **Hierarchical Tree View**: Organized service management in VS Code sidebar
- **Real-time Status Indicators**: Visual connection status for each service
- **Interactive Dashboard**: Modern webview panel for service overview
- **50+ Commands**: Quick access through Command Palette
- **Context Menus**: Right-click actions on services
- **Keyboard Shortcuts**: Fast workflow with keybindings
- **AI-Powered Development**: Integrated AI services for code generation and reasoning
- **Full-Stack Support**: From design to deployment in one place

## 📸 Screenshots

### Sidebar View

![Sidebar](screenshots/sidebar.png)

### Dashboard

![Dashboard](screenshots/dashboard.png)

## 🛠️ Installation

### From Source (Development)

1. Clone this repository
2. Run `npm install`
3. Press F5 to open Extension Development Host

### From Marketplace (Coming Soon)

Search for "DevHub" in VS Code Extensions

## 📋 Usage

### Opening DevHub

- Click DevHub icon in Activity Bar
- Or use Command Palette: `DevHub: Open Dashboard`
- Or keyboard shortcut: `Ctrl+Shift+D`

### Connecting Services

1. Expand a service in sidebar
2. Click "Connect" in Actions
3. Enter API key/credentials when prompted
4. Or use Command Palette: `DevHub: Connect Service`

### Available Commands

#### Service Management

- `DevHub: Open Dashboard` - Open main dashboard
- `DevHub: Connect Service` - Connect to a service
- `DevHub: Disconnect Service` - Disconnect from a service
- `DevHub: Connect All Services` - Connect to all disconnected services
- `DevHub: Disconnect All Services` - Disconnect from all services
- `DevHub: Refresh Services` - Refresh service list

#### Service-Specific Commands

- `DevHub: List GitHub Repositories` - View GitHub repositories
- `DevHub: List MongoDB Databases` - View MongoDB databases
- `DevHub: List Stripe Customers` - View Stripe customers
- `DevHub: List LemonSqueezy Products` - View LemonSqueezy products
- `DevHub: Store Context` - Save context data (Context 7)
- `DevHub: Solve with Reasoning` - Structured problem solving (Sequential Thinking)
- `DevHub: Crawl Website` - Extract website content (Firecrawl)
- `DevHub: List Directory` - Browse files (FileSystem)
- `DevHub: Open Browser` - Launch browser automation
- `DevHub: List Figma Files` - View design files
- `DevHub: List Tables` - View database tables (Supabase)
- `DevHub: List Vercel Projects` - View deployments
- `DevHub: List Sentry Projects` - View error tracking projects
- `DevHub: List Tasks` - View tasks (Taskmaster)
- `DevHub: Execute Command` - Run system commands (Desktop Commander)
- `DevHub: Generate Code` - AI-powered code generation (21st Dev)

## 🔧 Services

### 🐙 Development Tools

**GitHub** - Repository management, pull requests, issues, and collaboration
**21st Dev** - AI-powered code generation, project scaffolding, and autonomous development

### 🗄️ Database & Storage

**MongoDB** - NoSQL database management, collections, and queries
**Supabase** - Backend-as-a-Service with real-time database, auth, and storage
**FileSystem** - Local file system operations, project structure analysis

### 💳 Payment & E-commerce

**Stripe** - Payment processing, subscriptions, customer management
**LemonSqueezy** - E-commerce platform, product catalog, order management

### 🔐 Authentication & Security

**Auth** - OAuth providers, token management, user authentication
**Sentry** - Error tracking, performance monitoring, issue management

### 🚀 Deployment & Hosting

**Vercel** - Modern deployment platform, project management, logs
**Desktop Commander** - System administration, process management, command execution

### 🎨 Design & Content

**Figma** - Design file management, component inspection, asset export
**Firecrawl** - Web crawling, page scraping, content extraction
**Browser** - Browser automation, screenshot capture, web interaction

### 🧠 AI & Intelligence

**Context 7** - Context storage, retrieval, and management
**Sequential Thinking** - Structured reasoning, problem solving, alternative analysis

### 📋 Productivity

**Taskmaster** - Task management, project organization, deadline tracking

## 🎯 Use Cases

### Full-Stack Development Workflow

```
1. Generate project scaffold with 21st Dev
2. Clone repository with GitHub
3. Set up database with MongoDB/Supabase
4. Design UI components with Figma
5. Implement features with AI assistance from 21st Dev
6. Deploy to Vercel
7. Monitor with Sentry
8. Manage payments with Stripe/LemonSqueezy
```

### AI-Powered Development

```
1. Use Sequential Thinking for problem analysis
2. Generate code with 21st Dev
3. Store development context with Context 7
4. Automate testing with Browser
5. Deploy and monitor with Vercel + Sentry
```

### System Administration

```
1. Monitor system with Desktop Commander
2. Manage tasks with Taskmaster
3. Automate workflows with Browser
4. Track errors with Sentry
5. Manage files with FileSystem
```

## 🗺️ Roadmap

- [x] Phase 1: Project setup and basic structure
- [x] Phase 2: Core functionality (TreeView, Commands, Dashboard)
- [x] Phase 3: 17 MCP server implementation
- [x] Phase 4: AI integration and advanced features
- [ ] Phase 5: Analytics and notifications
- [ ] Phase 6: Marketplace release
- [ ] Phase 7: Community plugins and extensions

## 📊 Statistics

### Current Status

- **17 MCP Servers** implemented
- **50+ Commands** available
- **Zero TypeScript errors**
- **Zero ESLint warnings**
- **Production ready** codebase

### Service Categories

- **Development Tools**: 2 services
- **Database & Storage**: 3 services
- **Payment & E-commerce**: 2 services
- **Authentication & Security**: 2 services
- **Deployment & Hosting**: 2 services
- **Design & Content**: 3 services
- **AI & Intelligence**: 2 services
- **Productivity**: 1 service

## 💻 Development

### Prerequisites

- Node.js 18+
- VS Code 1.85+
- TypeScript 5.0+

### Build

```bash
npm run compile
```

### Test

```bash
npm test
```

### Package

```bash
npm run vscode:prepublish
```

### Development Workflow

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Compile TypeScript
npm run compile

# Run tests
npm test

# Check linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📚 Documentation

- [HOW-TO-USE.md](HOW-TO-USE.md) - Complete usage guide for all 17 services
- [PROJECT_ROADMAP.md](PROJECT_ROADMAP.md) - Detailed development roadmap
- [CHANGELOG.md](CHANGELOG.md) - Version history and updates

## 🏗️ Architecture

### Core Components

```
src/
├── extension.ts          # Main extension entry point
├── mcpManager.ts         # MCP server management
├── treeView.ts           # Sidebar tree view
├── webview.ts            # Dashboard webview
├── commands.ts           # Command registration
├── types.ts              # TypeScript interfaces
└── mcp-servers/         # 17 MCP server implementations
    ├── github/
    ├── mongodb/
    ├── stripe/
    ├── lemonsqueezy/
    ├── auth/
    ├── context7/
    ├── sequential-thinking/
    ├── firecrawl/
    ├── filesystem/
    ├── browser/
    ├── figma/
    ├── supabase/
    ├── vercel/
    ├── sentry/
    ├── taskmaster/
    ├── desktop-commander/
    └── 21st-dev/
```

### MCP Integration

Each MCP server implements:

- Connection management
- API key validation
- Service-specific operations
- Error handling
- Status monitoring

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint for code quality
- Add JSDoc comments for public APIs
- Test all MCP server connections
- Update documentation for new features

## 📧 Contact

- GitHub: https://github.com/Rarebox
- Email: info@birsonraki.net
- Issues: https://github.com/Rarebox/devhub-mcp/issues

## ⭐ Acknowledgments

- MCP Protocol by Anthropic
- VS Code Extension API
- Cline integration support
- All service providers for their APIs

## 📄 License

MIT License - see LICENSE file

---

**Made with ❤️ by Caglar Usta**

**17 MCP Servers - Complete Development Ecosystem** 🌟

---

## 🚀 Quick Start Guide

1. **Install**: Clone and run `npm install`
2. **Launch**: Press F5 in VS Code
3. **Connect**: Click DevHub icon → Connect services
4. **Use**: Command Palette (`Ctrl+Shift+P`) → `DevHub:` commands
5. **Develop**: Use all 17 services for your development workflow

**Happy coding with DevHub! 🎉**
