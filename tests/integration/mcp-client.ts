import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

export interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, unknown> | undefined;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export class MCPClient extends EventEmitter {
  private serverProcess: ChildProcess | null = null;
  private requestIdCounter = 0;
  private pendingRequests = new Map<
    string | number,
    {
      resolve: (value: unknown) => void;
      reject: (reason: unknown) => void;
      timeout: NodeJS.Timeout;
    }
  >();

  constructor(
    private serverPath: string,
    private env: Record<string, string> = {},
  ) {
    super();
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.serverProcess = spawn('node', [this.serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, ...this.env },
      });

      if (
        !this.serverProcess.stdout ||
        !this.serverProcess.stdin ||
        !this.serverProcess.stderr
      ) {
        reject(new Error('Failed to create server process streams'));
        return;
      }

      let buffer = '';
      this.serverProcess.stdout.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const response: MCPResponse = JSON.parse(line);
              this.handleResponse(response);
            } catch (error) {
              console.error('Failed to parse response:', line, error);
            }
          }
        }
      });

      this.serverProcess.stderr.on('data', (chunk) => {
        const output = chunk.toString();
        if (output.includes('MCP Server running')) {
          resolve();
        }
      });

      this.serverProcess.on('error', (error) => {
        reject(error);
      });

      this.serverProcess.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Server process exited with code ${code}`));
        }
      });

      setTimeout(() => {
        reject(new Error('Server startup timeout'));
      }, 30000);
    });
  }

  private handleResponse(response: MCPResponse): void {
    const pending = this.pendingRequests.get(response.id);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingRequests.delete(response.id);

      if (response.error) {
        pending.reject(
          new Error(`${response.error.code}: ${response.error.message}`),
        );
      } else {
        pending.resolve(response.result);
      }
    }
  }

  async sendRequest(
    method: string,
    params?: Record<string, unknown> | undefined,
  ): Promise<unknown> {
    if (!this.serverProcess || !this.serverProcess.stdin) {
      throw new Error('Server not started');
    }

    const id = ++this.requestIdCounter;
    const request: MCPRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timeout for method: ${method}`));
      }, 10000);

      this.pendingRequests.set(id, { resolve, reject, timeout });

      const requestLine = JSON.stringify(request) + '\n';
      this.serverProcess!.stdin!.write(requestLine);
    });
  }

  async listTools(): Promise<{
    tools: Array<{
      name: string;
      description: string;
      inputSchema: Record<string, unknown>;
    }>;
  }> {
    return this.sendRequest('tools/list') as Promise<{
      tools: Array<{
        name: string;
        description: string;
        inputSchema: Record<string, unknown>;
      }>;
    }>;
  }

  async callTool(
    name: string,
    arguments_: Record<string, unknown>,
  ): Promise<{ content: Array<{ type: string; text: string }> }> {
    const response = (await this.sendRequest('tools/call', {
      name,
      arguments: arguments_,
    })) as {
      content: Array<{ type: string; text: string }>;
      isError?: boolean;
    };

    if (response.isError) {
      throw new Error(response.content[0]?.text || 'Tool call failed');
    }

    return response;
  }

  async getServerInfo(): Promise<{
    protocolVersion: string;
    capabilities: Record<string, unknown>;
    serverInfo: Record<string, unknown>;
  }> {
    return this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {},
      },
      clientInfo: {
        name: 'playwright-test-client',
        version: '1.0.0',
      },
    }) as Promise<{
      protocolVersion: string;
      capabilities: Record<string, unknown>;
      serverInfo: Record<string, unknown>;
    }>;
  }

  async stop(): Promise<void> {
    if (this.serverProcess) {
      this.serverProcess.kill();
      this.serverProcess = null;
    }
    this.pendingRequests.clear();
  }
}
