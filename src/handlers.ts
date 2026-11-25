import type { CallToolResult } from '@modelcontextprotocol/server';
import type { ToolDefinition } from './tools.js';
import { log, makeApiRequest } from './utils.js';

/**
 * Runs one tool call against The Blue Alliance API.
 *
 * `args` must already be validated against `tool.inputSchema`; the MCP SDK
 * does that before invoking the registered callback. The TBA response is
 * validated against `tool.responseSchema` and returned as pretty-printed JSON
 * text. Any failure (HTTP error, network error, unexpected response shape) is
 * returned as an `isError` result rather than thrown, so the client receives
 * a tool error it can show to the model.
 */
export async function executeTool(
  tool: ToolDefinition,
  args: Parameters<ToolDefinition['endpoint']>[0],
): Promise<CallToolResult> {
  try {
    const data = await makeApiRequest(tool.endpoint(args));
    const result = tool.responseSchema.parse(data);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await log('error', `Tool execution error for '${tool.name}': ${message}`);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${message}`,
        },
      ],
      isError: true,
    };
  }
}
