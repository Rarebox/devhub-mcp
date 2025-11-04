# DevHub - Multi-Service Dashboard

**Manage your developer services from one place**

A VS Code extension that provides a unified dashboard for managing multiple developer services through MCP (Model Context Protocol) integration.

## 🚀 Features

- **5 Integrated Services**: GitHub, MongoDB, Authentication, Stripe, LemonSqueezy
- **Hierarchical Tree View**: Organized service management in VS Code sidebar
- **Real-time Status Indicators**: Visual connection status for each service
- **Interactive Dashboard**: Modern webview panel for service overview
- **10+ Commands**: Quick access through Command Palette
- **Context Menus**: Right-click actions on services
- **Keyboard Shortcuts**: Fast workflow with keybindings

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
3. Or use Command Palette: `DevHub: Connect Service`

### Available Commands

- `DevHub: Open Dashboard` - Open main dashboard
- `DevHub: Connect Service` - Connect to a service
- `DevHub: Disconnect Service` - Disconnect from a service
- `DevHub: Connect All Services` - Connect to all disconnected services
- `DevHub: Disconnect All Services` - Disconnect from all services
- `DevHub: Test Connection` - Test service connection health
- `DevHub: Configure Service` - Open service configuration
- `DevHub: Refresh Services` - Refresh service list
- `DevHub: Show Server Info` - Display server statistics
- `DevHub: View Logs` - Open activity logs

## 🔧 Services

### GitHub

Manage repositories, pull requests, and issues

### MongoDB

Database connection management

### Authentication

OAuth and API key management

### Stripe

Payment and subscription management

### LemonSqueezy

E-commerce and order management

## 🎯 Roadmap

- [x] Phase 1: Project setup
- [x] Phase 2: Core functionality (TreeView, Commands, Dashboard)
- [ ] Phase 3: Real MCP server implementation
- [ ] Phase 4: Advanced features (analytics, notifications)
- [ ] Phase 5: Marketplace release

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

## 📝 License

MIT License - see LICENSE file

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📧 Contact

- GitHub: https://github.com/Rarebox
- Email: info@birsonraki.net

## ⭐ Acknowledgments

- MCP Protocol by Anthropic
- VS Code Extension API
- Cline integration support

---

**Made with ❤️ by Caglar Usta**
