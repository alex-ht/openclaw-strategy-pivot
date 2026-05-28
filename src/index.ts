/**
 * openclaw-strategy-pivot
 *
 * An OpenClaw plugin that forces the agent to try completely different strategies
 * when tool execution fails (especially the `exec` tool).
 *
 * Standard OpenClaw plugin entry point.
 * Loaded automatically when the plugin is enabled via `openclaw plugins install`.
 */

export interface StrategyPivotConfig {
  /** Tools to monitor for failures. Default: ['exec'] */
  watchedTools?: string[];

  /** Custom prompt template. Use {toolName}, {error}, {result} as placeholders. */
  promptTemplate?: string;

  /** How many consecutive failures on the same tool before injecting the pivot prompt. Default: 1 */
  minFailuresBeforePivot?: number;
}

const DEFAULT_WATCHED_TOOLS = ['exec'];

const DEFAULT_PROMPT = `【重要：策略轉換】
剛才使用「{toolName}」執行失敗。

錯誤訊息：
{error}

請不要再嘗試相同或類似的方法（包含微調參數、重複執行）。
請重新思考問題的本質，改用**完全不同的策略、工具或流程**來達成原始目標。

請先清楚說明你接下來打算採用的全新方法，再開始執行。`;

interface FailureTracker {
  [toolName: string]: number;
}

const failureCount: FailureTracker = {};

export default function register(api: any, config: StrategyPivotConfig = {}) {
  const watchedTools = config.watchedTools ?? DEFAULT_WATCHED_TOOLS;
  const promptTemplate = config.promptTemplate ?? DEFAULT_PROMPT;
  const minFailures = config.minFailuresBeforePivot ?? 1;

  api.on('after_tool_call', async (context: any) => {
    const { toolName, error, result } = context;

    // Only care about watched tools
    if (!watchedTools.includes(toolName)) {
      return;
    }

    const hasError = !!error || isExecFailure(result);

    if (!hasError) {
      // Reset failure count on success
      failureCount[toolName] = 0;
      return;
    }

    // Increment failure count
    failureCount[toolName] = (failureCount[toolName] || 0) + 1;

    if (failureCount[toolName] < minFailures) {
      return;
    }

    const errorMessage = extractErrorMessage(error, result);

    // Build the pivot prompt
    const message = promptTemplate
      .replace('{toolName}', toolName)
      .replace('{error}', errorMessage)
      .replace('{result}', safeStringify(result));

    // Inject the guidance message into the conversation
    try {
      if (typeof api.appendMessage === 'function') {
        await api.appendMessage({
          role: 'user',
          content: message,
        });
      } else if (context.messages && Array.isArray(context.messages)) {
        context.messages.push({
          role: 'user',
          content: message,
        });
      } else {
        console.warn('[strategy-pivot] Could not find a way to inject message. Please check OpenClaw plugin API version.');
      }
    } catch (e) {
      console.error('[strategy-pivot] Failed to inject pivot message:', e);
    }

    // Reset counter after injecting to avoid spamming every turn
    failureCount[toolName] = 0;
  });

  console.log('[strategy-pivot] Plugin registered successfully. Watching tools:', watchedTools);
}

function isExecFailure(result: any): boolean {
  if (!result) return false;

  if (typeof result === 'object' && result.exitCode != null && result.exitCode !== 0) {
    return true;
  }

  if (typeof result === 'string' && /exit code|non-zero|failed|error/i.test(result)) {
    return true;
  }

  return false;
}

function extractErrorMessage(error: any, result: any): string {
  if (error) {
    return typeof error === 'string' ? error : error.message || JSON.stringify(error);
  }

  if (result) {
    if (typeof result === 'string') return result;
    if (result.stderr) return result.stderr;
    if (result.error) return result.error;
    return JSON.stringify(result, null, 2);
  }

  return 'Unknown error';
}

function safeStringify(obj: any): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}
