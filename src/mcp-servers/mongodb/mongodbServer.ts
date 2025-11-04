import { MongoClient, Db } from 'mongodb';

export interface MongoDBConfig {
    connectionString?: string;
    database?: string;
}

export interface MongoDBDatabase {
    name: string;
    sizeOnDisk?: number;
    empty?: boolean;
}

export interface MongoDBCollection {
    name: string;
    type?: string;
    options?: any;
    info?: any;
}

export interface MongoDBStats {
    databases: number;
    collections: number;
    dataSize: string;
}

export class MongoDBMcpServer {
    private client: MongoClient | null = null;
    private config: MongoDBConfig = {};
    private isConnected: boolean = false;
    private currentDb: Db | null = null;

    constructor(config?: MongoDBConfig) {
        if (config) {
            this.config = config;
        }
    }

    async connect(connectionString: string, database?: string): Promise<boolean> {
        try {
            console.log('Connecting to MongoDB...');
            
            this.client = new MongoClient(connectionString);
            await this.client.connect();
            
            // Test connection
            await this.client.db('admin').admin().ping();
            console.log('MongoDB connection successful');
            
            this.config.connectionString = connectionString;
            this.config.database = database;
            
            if (database) {
                this.currentDb = this.client.db(database);
            }
            
            this.isConnected = true;
            return true;
            
        } catch (error) {
            console.error('MongoDB connection error:', error);
            this.isConnected = false;
            this.client = null;
            return false;
        }
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.currentDb = null;
        }
        this.config.connectionString = undefined;
        this.config.database = undefined;
        this.isConnected = false;
        console.log('Disconnected from MongoDB');
    }

    getConnectionStatus(): boolean {
        return this.isConnected;
    }

    async listDatabases(): Promise<MongoDBDatabase[]> {
        if (!this.client || !this.isConnected) {
            throw new Error('Not connected to MongoDB');
        }

        try {
            const adminDb = this.client.db('admin').admin();
            const { databases } = await adminDb.listDatabases();
            
            return databases.map(db => ({
                name: db.name,
                sizeOnDisk: db.sizeOnDisk,
                empty: db.empty
            }));
            
        } catch (error) {
            console.error('Error listing databases:', error);
            throw error;
        }
    }

    async listCollections(database?: string): Promise<MongoDBCollection[]> {
        if (!this.client || !this.isConnected) {
            throw new Error('Not connected to MongoDB');
        }

        try {
            const dbName = database || this.config.database;
            if (!dbName) {
                throw new Error('No database specified');
            }

            const db = this.client.db(dbName);
            const collections = await db.listCollections().toArray();
            
            return collections.map(coll => ({
                name: coll.name,
                type: coll.type || 'collection',
                options: (coll as any).options,
                info: (coll as any).info
            }));
            
        } catch (error) {
            console.error('Error listing collections:', error);
            throw error;
        }
    }

    async getStats(): Promise<MongoDBStats> {
        if (!this.client || !this.isConnected) {
            throw new Error('Not connected to MongoDB');
        }

        try {
            const databases = await this.listDatabases();
            let totalCollections = 0;
            let totalSize = 0;

            for (const db of databases) {
                const collections = await this.listCollections(db.name);
                totalCollections += collections.length;
                totalSize += db.sizeOnDisk || 0;
            }

            return {
                databases: databases.length,
                collections: totalCollections,
                dataSize: `${(totalSize / 1024 / 1024).toFixed(2)} MB`
            };
            
        } catch (error) {
            console.error('Error getting stats:', error);
            throw error;
        }
    }

    async testConnection(): Promise<boolean> {
        if (!this.client || !this.isConnected) {
            return false;
        }

        try {
            await this.client.db('admin').admin().ping();
            return true;
        } catch (error) {
            console.error('Connection test failed:', error);
            return false;
        }
    }

    getConfig(): MongoDBConfig {
        return { ...this.config };
    }
}
