import axios from 'axios';

export interface ThinkingConfig {
    apiKey?: string;
}

export interface ThinkingStep {
    stepNumber: number;
    description: string;
    reasoning: string;
    conclusion: string;
}

export interface ThinkingChain {
    problem: string;
    steps: ThinkingStep[];
    finalConclusion: string;
    confidence: number;
    timestamp: string;
}

export class SequentialThinkingMcpServer {
    private apiKey: string | null = null;
    private isConnected: boolean = false;
    private thinkingChains: Map<string, ThinkingChain> = new Map();

    constructor(config?: ThinkingConfig) {
        if (config?.apiKey) {
            this.apiKey = config.apiKey;
        }
    }

    async connect(apiKey: string): Promise<boolean> {
        try {
            console.log('Connecting to Sequential Thinking...');
            
            this.apiKey = apiKey;
            
            // Validate API key format
            if (!apiKey || apiKey.length < 10) {
                throw new Error('Invalid API key format');
            }
            
            console.log('Sequential Thinking initialized successfully');
            this.isConnected = true;
            return true;
            
        } catch (error) {
            console.error('Sequential Thinking connection error:', error);
            this.isConnected = false;
            this.apiKey = null;
            return false;
        }
    }

    async disconnect(): Promise<void> {
        this.apiKey = null;
        this.isConnected = false;
        this.thinkingChains.clear();
        console.log('Disconnected from Sequential Thinking');
    }

    getConnectionStatus(): boolean {
        return this.isConnected;
    }

    async solveWithReasoning(problem: string): Promise<ThinkingChain> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Sequential Thinking');
        }

        try {
            // Simulated structured thinking process
            const steps: ThinkingStep[] = this.parseProblemIntoSteps(problem);
            
            const chain: ThinkingChain = {
                problem: problem,
                steps: steps,
                finalConclusion: this.synthesizeConclusion(steps),
                confidence: this.calculateConfidence(steps),
                timestamp: new Date().toISOString()
            };

            this.thinkingChains.set(chain.timestamp, chain);
            console.log(`Solved problem in ${steps.length} reasoning steps`);
            return chain;
            
        } catch (error) {
            console.error('Error solving with reasoning:', error);
            throw error;
        }
    }

    async reviseStep(chainId: string, stepNumber: number, newReasoning: string): Promise<ThinkingChain> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Sequential Thinking');
        }

        try {
            const chain = this.thinkingChains.get(chainId);
            if (!chain) {
                throw new Error('Thinking chain not found');
            }

            // Update specific step
            if (stepNumber > 0 && stepNumber <= chain.steps.length) {
                chain.steps[stepNumber - 1].reasoning = newReasoning;
                chain.finalConclusion = this.synthesizeConclusion(chain.steps);
                chain.confidence = this.calculateConfidence(chain.steps);
            }

            console.log(`Revised step ${stepNumber} with new reasoning`);
            return chain;
            
        } catch (error) {
            console.error('Error revising step:', error);
            throw error;
        }
    }

    async analyzeAlternative(problem: string, approach: string): Promise<ThinkingChain> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Sequential Thinking');
        }

        try {
            // Analyze alternative approach
            const steps: ThinkingStep[] = this.parseProblemIntoSteps(problem, approach);
            
            const chain: ThinkingChain = {
                problem: `${problem} (Alternative: ${approach})`,
                steps: steps,
                finalConclusion: this.synthesizeConclusion(steps),
                confidence: this.calculateConfidence(steps),
                timestamp: new Date().toISOString()
            };

            console.log(`Analyzed alternative approach: ${approach}`);
            return chain;
            
        } catch (error) {
            console.error('Error analyzing alternative:', error);
            throw error;
        }
    }

    async backtrackAndRevise(chainId: string, stepToBacktrack: number): Promise<ThinkingChain> {
        if (!this.apiKey || !this.isConnected) {
            throw new Error('Not connected to Sequential Thinking');
        }

        try {
            const chain = this.thinkingChains.get(chainId);
            if (!chain) {
                throw new Error('Thinking chain not found');
            }

            // Keep steps before backtrack point, discard after
            chain.steps = chain.steps.slice(0, stepToBacktrack - 1);
            chain.finalConclusion = this.synthesizeConclusion(chain.steps);
            chain.confidence = this.calculateConfidence(chain.steps);

            console.log(`Backtracked to step ${stepToBacktrack}`);
            return chain;
            
        } catch (error) {
            console.error('Error backtracking:', error);
            throw error;
        }
    }

    getThinkingChain(chainId: string): ThinkingChain | undefined {
        return this.thinkingChains.get(chainId);
    }

    getAllThinkingChains(): ThinkingChain[] {
        return Array.from(this.thinkingChains.values());
    }

    private parseProblemIntoSteps(problem: string, approach?: string): ThinkingStep[] {
        // Parse complex problems into logical steps
        const steps: ThinkingStep[] = [];
        
        steps.push({
            stepNumber: 1,
            description: 'Problem Analysis',
            reasoning: `Breaking down: ${problem}`,
            conclusion: 'Problem understood and decomposed'
        });

        steps.push({
            stepNumber: 2,
            description: 'Approach Selection',
            reasoning: approach || 'Selecting optimal approach based on problem type',
            conclusion: 'Approach determined'
        });

        steps.push({
            stepNumber: 3,
            description: 'Solution Development',
            reasoning: 'Developing structured solution',
            conclusion: 'Solution framework created'
        });

        steps.push({
            stepNumber: 4,
            description: 'Validation',
            reasoning: 'Validating solution against problem requirements',
            conclusion: 'Solution validated'
        });

        return steps;
    }

    private synthesizeConclusion(steps: ThinkingStep[]): string {
        if (steps.length === 0) return 'No steps to synthesize';
        
        const conclusionsText = steps.map(s => s.conclusion).join(' → ');
        return `Reasoning chain complete: ${conclusionsText}`;
    }

    private calculateConfidence(steps: ThinkingStep[]): number {
        // Confidence increases with number of reasoning steps
        const baseConfidence = 0.6;
        const stepBonus = Math.min(0.3, steps.length * 0.05);
        return Math.min(0.99, baseConfidence + stepBonus);
    }
}
