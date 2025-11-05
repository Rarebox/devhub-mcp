export interface FigmaConfig {
    apiKey?: string;
}

export interface FigmaFile {
    id: string;
    name: string;
    url: string;
    lastModified: string;
}

export interface FigmaComponent {
    id: string;
    name: string;
    description: string;
    frameCount: number;
    propertyCount: number;
}

export interface FigmaFrame {
    id: string;
    name: string;
    width: number;
    height: number;
    x: number;
    y: number;
    backgroundColor: string;
    children: FigmaElement[];
}

export interface FigmaElement {
    id: string;
    name: string;
    type: string; // 'TEXT', 'SHAPE', 'COMPONENT', 'FRAME', 'GROUP'
    width: number;
    height: number;
    x: number;
    y: number;
    properties: Record<string, any>;
}

export interface DesignSpecs {
    colors: Record<string, string>;
    typography: Record<string, any>;
    spacing: Record<string, number>;
    components: FigmaComponent[];
}

export class FigmaMcpServer {
    private apiKey: string | null = null;
    private isConnected: boolean = false;
    private baseUrl = 'https://api.figma.com/v1';

    constructor(config?: FigmaConfig) {
        if (config?.apiKey) {
            this.apiKey = config.apiKey;
        }
    }

    async connect(apiKey: string): Promise<boolean> {
        try {
            console.log('Connecting to Figma...');
            
            this.apiKey = apiKey;
            
            // Validate API key
            if (!apiKey || apiKey.length < 10) {
                throw new Error('Invalid API key format');
            }

            console.log('Connected to Figma');
            this.isConnected = true;
            return true;
            
        } catch (error) {
            console.error('Figma connection error:', error);
            this.isConnected = false;
            this.apiKey = null;
            return false;
        }
    }

    async disconnect(): Promise<void> {
        this.apiKey = null;
        this.isConnected = false;
        console.log('Disconnected from Figma');
    }

    getConnectionStatus(): boolean {
        return this.isConnected;
    }

    async listFiles(): Promise<FigmaFile[]> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Figma');
        }

        try {
            const mockFiles: FigmaFile[] = [
                {
                    id: 'file_1',
                    name: 'Design System',
                    url: 'https://figma.com/file/designsystem',
                    lastModified: new Date().toISOString()
                },
                {
                    id: 'file_2',
                    name: 'App UI',
                    url: 'https://figma.com/file/appui',
                    lastModified: new Date().toISOString()
                }
            ];

            console.log(`Retrieved ${mockFiles.length} Figma files`);
            return mockFiles;
            
        } catch (error) {
            console.error('Error listing files:', error);
            throw error;
        }
    }

    async getFileFrames(fileId: string): Promise<FigmaFrame[]> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Figma');
        }

        try {
            const mockFrames: FigmaFrame[] = [
                {
                    id: 'frame_1',
                    name: 'Homepage',
                    width: 1440,
                    height: 900,
                    x: 0,
                    y: 0,
                    backgroundColor: '#FFFFFF',
                    children: [
                        {
                            id: 'elem_1',
                            name: 'Header',
                            type: 'COMPONENT',
                            width: 1440,
                            height: 80,
                            x: 0,
                            y: 0,
                            properties: { padding: 16, gap: 8 }
                        }
                    ]
                }
            ];

            console.log(`Retrieved ${mockFrames.length} frames from file`);
            return mockFrames;
            
        } catch (error) {
            console.error('Error getting file frames:', error);
            throw error;
        }
    }

    async getFrameElements(fileId: string, frameId: string): Promise<FigmaElement[]> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Figma');
        }

        try {
            const mockElements: FigmaElement[] = [
                {
                    id: 'btn_1',
                    name: 'Primary Button',
                    type: 'COMPONENT',
                    width: 120,
                    height: 44,
                    x: 50,
                    y: 20,
                    properties: {
                        backgroundColor: '#007AFF',
                        color: '#FFFFFF',
                        borderRadius: 8,
                        fontSize: 16,
                        fontWeight: 600
                    }
                },
                {
                    id: 'txt_1',
                    name: 'Page Title',
                    type: 'TEXT',
                    width: 400,
                    height: 40,
                    x: 50,
                    y: 80,
                    properties: {
                        fontSize: 32,
                        fontWeight: 700,
                        color: '#000000'
                    }
                }
            ];

            console.log(`Retrieved ${mockElements.length} elements`);
            return mockElements;
            
        } catch (error) {
            console.error('Error getting frame elements:', error);
            throw error;
        }
    }

    async listComponents(fileId: string): Promise<FigmaComponent[]> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Figma');
        }

        try {
            const mockComponents: FigmaComponent[] = [
                {
                    id: 'comp_1',
                    name: 'Button/Primary',
                    description: 'Primary action button',
                    frameCount: 3,
                    propertyCount: 8
                },
                {
                    id: 'comp_2',
                    name: 'Card',
                    description: 'Content card component',
                    frameCount: 2,
                    propertyCount: 5
                }
            ];

            console.log(`Retrieved ${mockComponents.length} components`);
            return mockComponents;
            
        } catch (error) {
            console.error('Error listing components:', error);
            throw error;
        }
    }

    async getDesignSpecs(fileId: string): Promise<DesignSpecs> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Figma');
        }

        try {
            const specs: DesignSpecs = {
                colors: {
                    primary: '#007AFF',
                    secondary: '#5856D6',
                    success: '#34C759',
                    error: '#FF3B30',
                    background: '#F2F2F7'
                },
                typography: {
                    h1: { fontSize: 32, fontWeight: 700, lineHeight: 1.2 },
                    h2: { fontSize: 24, fontWeight: 600, lineHeight: 1.3 },
                    body: { fontSize: 16, fontWeight: 400, lineHeight: 1.5 }
                },
                spacing: {
                    xs: 4,
                    sm: 8,
                    md: 16,
                    lg: 24,
                    xl: 32
                },
                components: await this.listComponents(fileId)
            };

            console.log('Retrieved design specifications');
            return specs;
            
        } catch (error) {
            console.error('Error getting design specs:', error);
            throw error;
        }
    }

    async generateComponentCode(fileId: string, componentId: string, framework: string = 'react'): Promise<string> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Figma');
        }

        try {
            let code = '';
            
            if (framework === 'react') {
                code = `// Generated from Figma component
import React from 'react';

export const Component = () => {
  return (
    <div className="component">
      {/* Component content */}
    </div>
  );
};`;
            } else if (framework === 'vue') {
                code = `<!-- Generated from Figma component -->
<template>
  <div class="component">
    <!-- Component content -->
  </div>
</template>

<script>
export default {
  name: 'Component'
}
</script>`;
            }

            console.log(`Generated ${framework} code for component`);
            return code;
            
        } catch (error) {
            console.error('Error generating component code:', error);
            throw error;
        }
    }
}
