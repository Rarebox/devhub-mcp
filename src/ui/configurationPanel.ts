import * as vscode from 'vscode';

export class ConfigurationPanel {
    public static createPanel(
        extensionUri: vscode.Uri,
        serverId: string,
        serverName: string
    ): vscode.WebviewPanel {
        const panel = vscode.window.createWebviewPanel(
            'devhubConfig',
            `${serverName} Configuration`,
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        panel.webview.html = this.getWebviewContent(serverName);
        return panel;
    }

    private static getWebviewContent(serverName: string): string {
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${serverName} Configuration</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #1e1e1e;
            color: #e0e0e0;
            padding: 20px;
        }
        
        .config-form {
            max-width: 600px;
            margin: 0 auto;
        }
        
        h1 {
            color: #007ACC;
            margin-bottom: 30px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
        }
        
        input {
            width: 100%;
            padding: 10px;
            background: #3e3e42;
            border: 1px solid #555;
            color: #e0e0e0;
            border-radius: 4px;
        }
        
        input:focus {
            outline: none;
            border-color: #007ACC;
            box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
        }
        
        button {
            background: linear-gradient(135deg, #007ACC, #1E90FF);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            margin-right: 10px;
        }
        
        button:hover {
            background: linear-gradient(135deg, #005a9e, #1570d0);
        }
        
        .info-box {
            background: rgba(0, 122, 204, 0.1);
            border-left: 4px solid #007ACC;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="config-form">
        <h1>⚙️ Configure ${serverName}</h1>
        
        <div class="info-box">
            <p>Enter your ${serverName} credentials to connect.</p>
        </div>
        
        <form id="configForm">
            <div class="form-group">
                <label for="apiKey">API Key / Token:</label>
                <input 
                    type="password" 
                    id="apiKey" 
                    placeholder="Enter your API key"
                    required
                >
            </div>
            
            <div class="form-group">
                <label for="project">Project / Organization (if applicable):</label>
                <input 
                    type="text" 
                    id="project" 
                    placeholder="Enter project ID or name"
                >
            </div>
            
            <div style="margin-top: 30px;">
                <button type="submit">Save Configuration</button>
                <button type="button" onclick="window.close()">Cancel</button>
            </div>
        </form>
    </div>
    
    <script>
        const vscode = acquireVsCodeApi();
        
        document.getElementById('configForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const config = {
                apiKey: document.getElementById('apiKey').value,
                project: document.getElementById('project').value
            };
            
            vscode.postMessage({
                command: 'saveConfig',
                config: config
            });
        });
    </script>
</body>
</html>`;
    }
}
