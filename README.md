# openclaw-strategy-pivot

An OpenClaw plugin that detects tool execution failures and **forces the agent to abandon its current approach** by injecting a strong guidance prompt.

When a watched tool (especially `exec`) fails, instead of letting the agent keep retrying similar methods, this plugin injects a clear instruction telling the agent to try a **completely different strategy**.

## Features

- Listens to the `after_tool_call` hook
- Monitors specific tools (default: `exec`)
- Tracks consecutive failures
- Injects a strong, configurable prompt that discourages repeating the same approach
- Fully configurable via `openclaw.plugin.json` schema

## Installation via Git (Recommended)

This plugin is designed to be installed directly from GitHub:

```bash
openclaw plugins install git:https://github.com/alex-ht/openclaw-strategy-pivot
```

After installation, restart the gateway:

```bash
openclaw gateway restart
```

### Alternative: Manual Git Installation

```bash
# 1. Clone the repository
git clone https://github.com/alex-ht/openclaw-strategy-pivot.git
cd openclaw-strategy-pivot

# 2. Install dependencies and build
npm install
npm run build

# 3. Install the plugin from local path
openclaw plugins install .

# 4. Restart gateway
openclaw gateway restart
```

## Configuration

You can configure the plugin when enabling it or through OpenClaw's plugin configuration system.

Example configuration:

```json
{
  "watchedTools": ["exec"],
  "minFailuresBeforePivot": 1,
  "promptTemplate": "【重要：策略轉換】剛才使用「{toolName}」失敗。請改用完全不同的策略..."
}
```

### Available Options

| Option                    | Type     | Default     | Description |
|---------------------------|----------|-------------|-----------|
| `watchedTools`            | string[] | `["exec"]`  | Which tools to monitor for failures |
| `minFailuresBeforePivot`  | number   | `1`         | How many consecutive failures before injecting the message |
| `promptTemplate`          | string   | (strong default) | Custom message. Supports `{toolName}`, `{error}`, `{result}` placeholders |

If `promptTemplate` is not provided, the plugin uses a deliberately strong default message designed to break retry loops.

## How It Works

1. Registers an `after_tool_call` hook
2. When a watched tool returns an error (or non-zero exit code), increments a per-tool failure counter
3. Once the failure count reaches `minFailuresBeforePivot`, injects the pivot guidance as a user message
4. Resets the counter after injection to avoid flooding the conversation

## Recommended Use Cases

- Agents that get stuck in loops when shell/exec commands keep failing
- Situations where the agent is overly attached to one approach
- Complex debugging or exploration tasks where strategic pivoting is valuable

## Development

```bash
npm install
npm run build
```

## License

MIT
