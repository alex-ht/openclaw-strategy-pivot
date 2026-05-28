# openclaw-strategy-pivot

An OpenClaw plugin that detects tool execution failures and **forces the agent to abandon its current approach** by injecting a strong guidance prompt.

When a tool (especially `exec`) fails, instead of letting the agent keep retrying similar methods, this plugin injects a clear instruction telling the agent to try a **completely different strategy**.

## Features

- Detects tool execution errors via `after_tool_call` hook
- Supports filtering by specific tool names (e.g. only `exec`, or `exec` + `web_search`)
- Injects a strong, configurable prompt that discourages retrying the same approach
- Easy to customize the failure message

## Installation

```bash
# Coming soon - will be publishable to ClawHub
```

For now, you can load it locally in your OpenClaw configuration.

## Configuration

Create a plugin configuration (example):

```ts
// In your OpenClaw plugin registration
import strategyPivot from 'openclaw-strategy-pivot';

strategyPivot.register(api, {
  // Tools to monitor (default: ['exec'])
  watchedTools: ['exec', 'shell', 'run_command'],

  // Custom prompt template (optional)
  promptTemplate: `【策略轉換提示】
剛才使用「{toolName}」執行失敗，錯誤如下：
{error}

請不要再嘗試類似或微調相同的方法。
請重新思考問題的本質，改用**完全不同的策略或工具**來達成目標。
請先說明你接下來打算使用的全新方法。`,

  // Minimum number of consecutive failures before triggering strong guidance (default: 1)
  minFailuresBeforePivot: 1,
});
```

### Default Behavior

If no custom `promptTemplate` is provided, the plugin uses a strong default message that emphasizes abandoning the current direction.

## How It Works

1. Listens to the `after_tool_call` plugin hook.
2. When a watched tool fails (has `error` or non-zero exit), it checks the failure count.
3. If conditions are met, it appends a specially crafted message to the conversation.
4. The agent will see this message in the next reasoning turn and (ideally) switch strategies.

## Recommended Prompt Philosophy

The injected prompt is deliberately strong because LLMs often stubbornly retry similar approaches even after failure. The goal is to break the loop by explicitly forbidding "similar methods."

## Development

```bash
npm install
npm run build
```

## Roadmap

- [ ] Publish to ClawHub
- [ ] Support failure count tracking across sessions
- [ ] Add `before_tool_call` pre-blocking capability
- [ ] Better integration with OpenClaw's official plugin system

## Contributing

Issues and PRs are welcome, especially around prompt engineering for better strategic pivots.

## License

MIT
