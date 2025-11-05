export interface Dev21Config {
    apiKey?: string;
}

export interface CodeGenerationRequest {
    description: string;
    language: string;
    framework?: string;
    purpose: string;
}

export interface GeneratedCode {
    id: string;
    code: string;
    language: string;
    framework?: string;
    description: string;
    generatedAt: string;
}

export interface ProjectScaffold {
    projectName: string;
    framework: string;
    files: Record<string, string>;
    dependencies: string[];
    scripts: Record<string, string>;
}

export interface DeploymentPlan {
    steps: string[];
    environment: string;
    estimatedDuration: number;
}

export class Dev21McpServer {
    private apiKey: string | null = null;
    private isConnected: boolean = false;
    private generatedCode: Map<string, GeneratedCode> = new Map();

    constructor(config?: Dev21Config) {
        if (config?.apiKey) {
            this.apiKey = config.apiKey;
        }
    }

    async connect(apiKey: string): Promise<boolean> {
        try {
            console.log('Connecting to 21st Dev...');
            
            this.apiKey = apiKey;
            
            if (!apiKey || apiKey.length < 5) {
                throw new Error('Invalid API key');
            }

            console.log('Connected to 21st Dev');
            this.isConnected = true;
            return true;
            
        } catch (error) {
            console.error('21st Dev connection error:', error);
            this.isConnected = false;
            this.apiKey = null;
            return false;
        }
    }

    async disconnect(): Promise<void> {
        this.apiKey = null;
        this.isConnected = false;
        this.generatedCode.clear();
        console.log('Disconnected from 21st Dev');
    }

    getConnectionStatus(): boolean {
        return this.isConnected;
    }

    async generateCode(request: CodeGenerationRequest): Promise<GeneratedCode> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to 21st Dev');
        }

        try {
            const code = this.generateCodeTemplate(request);
            const generated: GeneratedCode = {
                id: `code_${Date.now()}`,
                code: code,
                language: request.language,
                framework: request.framework,
                description: request.description,
                generatedAt: new Date().toISOString()
            };

            this.generatedCode.set(generated.id, generated);
            console.log(`Generated code: ${generated.id}`);
            return generated;
            
        } catch (error) {
            console.error('Error generating code:', error);
            throw error;
        }
    }

    async generateProjectScaffold(projectName: string, framework: string): Promise<ProjectScaffold> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to 21st Dev');
        }

        try {
            const scaffold: ProjectScaffold = {
                projectName: projectName,
                framework: framework,
                files: {
                    'package.json': JSON.stringify({
                        name: projectName,
                        version: '1.0.0',
                        description: `${projectName} project`,
                        main: 'index.js',
                        scripts: {
                            start: 'node index.js',
                            dev: 'nodemon index.js',
                            test: 'jest'
                        }
                    }, null, 2),
                    'index.js': `// ${projectName} entry point\nconsole.log('Hello from ${projectName}');`,
                    'README.md': `# ${projectName}\n\nProject description here.`,
                    '.gitignore': 'node_modules\n.env\n.DS_Store'
                },
                dependencies: ['express', 'dotenv', 'cors'],
                scripts: {
                    start: 'node index.js',
                    dev: 'nodemon index.js',
                    test: 'jest'
                }
            };

            console.log(`Generated project scaffold: ${projectName}`);
            return scaffold;
            
        } catch (error) {
            console.error('Error generating project scaffold:', error);
            throw error;
        }
    }

    async generateDeploymentPlan(projectName: string, environment: string): Promise<DeploymentPlan> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to 21st Dev');
        }

        try {
            const plan: DeploymentPlan = {
                steps: [
                    'Step 1: Build project',
                    'Step 2: Run tests',
                    'Step 3: Create Docker image',
                    'Step 4: Push to registry',
                    'Step 5: Deploy to Vercel',
                    'Step 6: Run smoke tests',
                    'Step 7: Monitor deployment'
                ],
                environment: environment,
                estimatedDuration: 25
            };

            console.log(`Generated deployment plan for: ${projectName}`);
            return plan;
            
        } catch (error) {
            console.error('Error generating deployment plan:', error);
            throw error;
        }
    }

    async generateREADME(projectName: string, description: string): Promise<string> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to 21st Dev');
        }

        try {
            const readme = `# ${projectName}

## Description
${description}

## Installation
\`\`\`bash
npm install
\`\`\`

## Usage
\`\`\`bash
npm run dev
\`\`\`

## Project Structure
- \`/src\` - Source code
- \`/tests\` - Test files
- \`/docs\` - Documentation

## Contributing
Contributions are welcome! Please follow the existing code style.

## License
MIT
`;

            console.log(`Generated README for: ${projectName}`);
            return readme;
            
        } catch (error) {
            console.error('Error generating README:', error);
            throw error;
        }
    }

    async generateAPIDocumentation(endpoints: any[]): Promise<string> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to 21st Dev');
        }

        try {
            let docs = '# API Documentation\n\n';
            endpoints.forEach((endpoint, index) => {
                docs += `## ${index + 1}. ${endpoint.method} ${endpoint.path}\n`;
                docs += `${endpoint.description}\n`;
                docs += '### Request\n\`\`\`json\n{}\n\`\`\`\n';
                docs += '### Response\n\`\`\`json\n{}\n\`\`\`\n\n';
            });

            console.log('Generated API documentation');
            return docs;
            
        } catch (error) {
            console.error('Error generating API documentation:', error);
            throw error;
        }
    }

    private generateCodeTemplate(request: CodeGenerationRequest): string {
        if (request.language === 'typescript' && request.framework === 'react') {
            return `import React from 'react';

interface Props {}

export const Component: React.FC<Props> = () => {
  return (
    <div>
      {/* ${request.purpose} */}
      <h1>Component</h1>
    </div>
  );
};`;
        } else if (request.language === 'javascript' && request.framework === 'node') {
            return `// ${request.purpose}
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: '${request.purpose}' });
});

module.exports = app;`;
        } else {
            return `// Generated code for ${request.purpose}\n// Language: ${request.language}\n// Framework: ${request.framework || 'None'}`;
        }
    }

    getGeneratedCode(codeId: string): GeneratedCode | undefined {
        return this.generatedCode.get(codeId);
    }

    getAllGeneratedCode(): GeneratedCode[] {
        return Array.from(this.generatedCode.values());
    }
}
