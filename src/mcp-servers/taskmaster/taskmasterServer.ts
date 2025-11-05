export interface TaskmasterConfig {
    apiKey?: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: string; // 'todo', 'in-progress', 'review', 'done'
    priority: string; // 'low', 'medium', 'high', 'critical'
    assignee?: string;
    dueDate?: string;
    tags: string[];
}

export interface Project {
    id: string;
    name: string;
    description: string;
    status: string;
    tasks: number;
    completedTasks: number;
}

export interface Sprint {
    id: string;
    name: string;
    status: string;
    startDate: string;
    endDate: string;
    tasks: number;
    completedTasks: number;
}

export interface ProjectStats {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    completionPercentage: number;
    averageTaskDuration: number;
}

export class TaskmasterMcpServer {
    private apiKey: string | null = null;
    private isConnected: boolean = false;
    private tasks: Map<string, Task> = new Map();

    constructor(config?: TaskmasterConfig) {
        if (config?.apiKey) {
            this.apiKey = config.apiKey;
        }
    }

    async connect(apiKey: string): Promise<boolean> {
        try {
            console.log('Connecting to Taskmaster...');
            
            this.apiKey = apiKey;
            
            if (!apiKey || apiKey.length < 5) {
                throw new Error('Invalid API key');
            }

            console.log('Connected to Taskmaster');
            this.isConnected = true;
            return true;
            
        } catch (error) {
            console.error('Taskmaster connection error:', error);
            this.isConnected = false;
            this.apiKey = null;
            return false;
        }
    }

    async disconnect(): Promise<void> {
        this.apiKey = null;
        this.isConnected = false;
        this.tasks.clear();
        console.log('Disconnected from Taskmaster');
    }

    getConnectionStatus(): boolean {
        return this.isConnected;
    }

    async listProjects(): Promise<Project[]> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Taskmaster');
        }

        try {
            const mockProjects: Project[] = [
                {
                    id: 'proj_1',
                    name: 'DevHub Development',
                    description: 'Build the ultimate developer dashboard',
                    status: 'active',
                    tasks: 48,
                    completedTasks: 32
                },
                {
                    id: 'proj_2',
                    name: 'Documentation',
                    description: 'Complete project documentation',
                    status: 'active',
                    tasks: 12,
                    completedTasks: 8
                }
            ];

            console.log(`Retrieved ${mockProjects.length} projects`);
            return mockProjects;
            
        } catch (error) {
            console.error('Error listing projects:', error);
            throw error;
        }
    }

    async listTasks(projectId: string): Promise<Task[]> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Taskmaster');
        }

        try {
            const mockTasks: Task[] = [
                {
                    id: 'task_1',
                    title: 'Implement Stripe integration',
                    description: 'Add payment processing with Stripe API',
                    status: 'done',
                    priority: 'high',
                    assignee: 'dev1',
                    dueDate: '2025-11-05',
                    tags: ['payment', 'api', 'integration']
                },
                {
                    id: 'task_2',
                    title: 'Setup monitoring with Sentry',
                    description: 'Configure error tracking',
                    status: 'in-progress',
                    priority: 'high',
                    assignee: 'dev2',
                    dueDate: '2025-11-06',
                    tags: ['monitoring', 'devops']
                },
                {
                    id: 'task_3',
                    title: 'Write API documentation',
                    description: 'Complete endpoint documentation',
                    status: 'todo',
                    priority: 'medium',
                    dueDate: '2025-11-08',
                    tags: ['documentation', 'api']
                }
            ];

            console.log(`Retrieved ${mockTasks.length} tasks`);
            return mockTasks;
            
        } catch (error) {
            console.error('Error listing tasks:', error);
            throw error;
        }
    }

    async createTask(projectId: string, task: Partial<Task>): Promise<Task> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Taskmaster');
        }

        try {
            const newTask: Task = {
                id: `task_${Date.now()}`,
                title: task.title || 'New Task',
                description: task.description || '',
                status: 'todo',
                priority: task.priority || 'medium',
                tags: task.tags || []
            };

            this.tasks.set(newTask.id, newTask);
            console.log(`Created task: ${newTask.id}`);
            return newTask;
            
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    }

    async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Taskmaster');
        }

        try {
            const task = this.tasks.get(taskId);
            if (!task) {
                throw new Error('Task not found');
            }

            const updated = { ...task, ...updates };
            this.tasks.set(taskId, updated);
            console.log(`Updated task: ${taskId}`);
            return updated;
            
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    }

    async listSprints(projectId: string): Promise<Sprint[]> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Taskmaster');
        }

        try {
            const mockSprints: Sprint[] = [
                {
                    id: 'sprint_1',
                    name: 'Sprint 1 - MCP Integration',
                    status: 'active',
                    startDate: '2025-10-29',
                    endDate: '2025-11-12',
                    tasks: 24,
                    completedTasks: 18
                },
                {
                    id: 'sprint_2',
                    name: 'Sprint 2 - Testing & Polish',
                    status: 'planned',
                    startDate: '2025-11-13',
                    endDate: '2025-11-26',
                    tasks: 16,
                    completedTasks: 0
                }
            ];

            console.log(`Retrieved ${mockSprints.length} sprints`);
            return mockSprints;
            
        } catch (error) {
            console.error('Error listing sprints:', error);
            throw error;
        }
    }

    async getProjectStats(projectId: string): Promise<ProjectStats> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Taskmaster');
        }

        try {
            const stats: ProjectStats = {
                totalTasks: 48,
                completedTasks: 32,
                inProgressTasks: 12,
                completionPercentage: 66.7,
                averageTaskDuration: 3.5
            };

            console.log('Retrieved project statistics');
            return stats;
            
        } catch (error) {
            console.error('Error getting project stats:', error);
            throw error;
        }
    }

    async completeTask(taskId: string): Promise<boolean> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Taskmaster');
        }

        try {
            const task = this.tasks.get(taskId);
            if (!task) {
                throw new Error('Task not found');
            }

            task.status = 'done';
            this.tasks.set(taskId, task);
            console.log(`Completed task: ${taskId}`);
            return true;
            
        } catch (error) {
            console.error('Error completing task:', error);
            throw error;
        }
    }
}
