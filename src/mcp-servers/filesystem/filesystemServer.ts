import * as fs from 'fs';
import * as path from 'path';

export interface FilesystemConfig {
    rootPath?: string;
}

export interface FileInfo {
    path: string;
    isDirectory: boolean;
    size: number;
    modified: string;
    content?: string;
}

export interface DirectoryTree {
    path: string;
    items: FileInfo[];
}

export class FilesystemMcpServer {
    private rootPath: string = process.cwd();
    private isConnected: boolean = false;

    constructor(config?: FilesystemConfig) {
        if (config?.rootPath) {
            this.rootPath = config.rootPath;
        }
    }

    async connect(): Promise<boolean> {
        try {
            console.log(`Connecting to FileSystem: ${this.rootPath}`);
            
            // Verify root path exists
            if (!fs.existsSync(this.rootPath)) {
                throw new Error(`Root path does not exist: ${this.rootPath}`);
            }

            this.isConnected = true;
            console.log('FileSystem connected successfully');
            return true;
            
        } catch (error) {
            console.error('FileSystem connection error:', error);
            this.isConnected = false;
            return false;
        }
    }

    async disconnect(): Promise<void> {
        this.isConnected = false;
        console.log('Disconnected from FileSystem');
    }

    getConnectionStatus(): boolean {
        return this.isConnected;
    }

    async listDirectory(dirPath: string = ''): Promise<DirectoryTree> {
        if (!this.isConnected) {
            throw new Error('Not connected to FileSystem');
        }

        try {
            const fullPath = path.join(this.rootPath, dirPath);
            const items = fs.readdirSync(fullPath);

            const fileInfos: FileInfo[] = items.map(item => {
                const itemPath = path.join(fullPath, item);
                const stat = fs.statSync(itemPath);
                const relativePath = path.relative(this.rootPath, itemPath);

                return {
                    path: relativePath,
                    isDirectory: stat.isDirectory(),
                    size: stat.size,
                    modified: stat.mtime.toISOString()
                };
            });

            return {
                path: dirPath || '/',
                items: fileInfos
            };
            
        } catch (error) {
            console.error('Error listing directory:', error);
            throw error;
        }
    }

    async readFile(filePath: string): Promise<FileInfo> {
        if (!this.isConnected) {
            throw new Error('Not connected to FileSystem');
        }

        try {
            const fullPath = path.join(this.rootPath, filePath);
            const stat = fs.statSync(fullPath);
            const content = fs.readFileSync(fullPath, 'utf-8');

            return {
                path: filePath,
                isDirectory: false,
                size: stat.size,
                modified: stat.mtime.toISOString(),
                content: content
            };
            
        } catch (error) {
            console.error('Error reading file:', error);
            throw error;
        }
    }

    async writeFile(filePath: string, content: string): Promise<FileInfo> {
        if (!this.isConnected) {
            throw new Error('Not connected to FileSystem');
        }

        try {
            const fullPath = path.join(this.rootPath, filePath);
            const dirPath = path.dirname(fullPath);

            // Create directory if it doesn't exist
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            fs.writeFileSync(fullPath, content, 'utf-8');
            const stat = fs.statSync(fullPath);

            console.log(`File written: ${filePath}`);

            return {
                path: filePath,
                isDirectory: false,
                size: stat.size,
                modified: stat.mtime.toISOString()
            };
            
        } catch (error) {
            console.error('Error writing file:', error);
            throw error;
        }
    }

    async deleteFile(filePath: string): Promise<boolean> {
        if (!this.isConnected) {
            throw new Error('Not connected to FileSystem');
        }

        try {
            const fullPath = path.join(this.rootPath, filePath);
            fs.unlinkSync(fullPath);
            console.log(`File deleted: ${filePath}`);
            return true;
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }

    async searchFiles(pattern: string, maxResults: number = 50): Promise<FileInfo[]> {
        if (!this.isConnected) {
            throw new Error('Not connected to FileSystem');
        }

        try {
            const results: FileInfo[] = [];
            const regex = new RegExp(pattern, 'i');

            const searchDir = (dir: string) => {
                if (results.length >= maxResults) return;

                const items = fs.readdirSync(dir);
                for (const item of items) {
                    const fullPath = path.join(dir, item);
                    const stat = fs.statSync(fullPath);
                    const relativePath = path.relative(this.rootPath, fullPath);

                    if (regex.test(relativePath)) {
                        results.push({
                            path: relativePath,
                            isDirectory: stat.isDirectory(),
                            size: stat.size,
                            modified: stat.mtime.toISOString()
                        });
                    }

                    if (stat.isDirectory() && results.length < maxResults) {
                        searchDir(fullPath);
                    }
                }
            };

            searchDir(this.rootPath);
            return results;
            
        } catch (error) {
            console.error('Error searching files:', error);
            throw error;
        }
    }

    getProjectStructure(): DirectoryTree {
        try {
            const items = fs.readdirSync(this.rootPath);
            const fileInfos: FileInfo[] = items.map(item => {
                const itemPath = path.join(this.rootPath, item);
                const stat = fs.statSync(itemPath);

                return {
                    path: item,
                    isDirectory: stat.isDirectory(),
                    size: stat.size,
                    modified: stat.mtime.toISOString()
                };
            });

            return {
                path: this.rootPath,
                items: fileInfos
            };
        } catch (error) {
            console.error('Error getting project structure:', error);
            throw error;
        }
    }
}
