# openclaw-strategy-pivot

An OpenClaw plugin that detects tool execution failures and **forces the agent to abandon its current approach** by injecting a strong guidance prompt.

When a watched tool (especially `exec`) fails repeatedly, this plugin injects a clear instruction telling the agent to try a **completely different strategy**.

This plugin is built using the official OpenClaw Plugin SDK (`definePluginEntry`).

## Features

- Uses official `after_tool_call` hook via Plugin SDK
- Monitors specific tools (default: `exec`)
- Tracks consecutive failures
- Injects a strong, configurable prompt
- Proper typed integration with OpenClaw

## Installation (Git only)

This plugin is distributed via Git (not published on npm).

```bash
# Recommended way
openclaw plugins install git:https://github.com/alex-ht/openclaw-strategy-pivot

openclaw gateway restart
```

### Manual installation (for development)

```bash
git clone https://github.com/alex-ht/openclaw-strategy-pivot.git
cd openclaw-strategy-pivot

npm install          # This will install openclaw as devDependency
npm run build

openclaw plugins install .
openclaw gateway restart
```

> **Note**: Because this plugin declares `openclaw` as a peer dependency, your OpenClaw installation must be present. The OpenClaw runtime will link it automatically during `plugins install`.

## Configuration

```json
{
  "watchedTools": ["exec"],
  "minFailuresBeforePivot": 1
}
```

### Options

| Option                    | Type     | Default      | Description |
|---------------------------|----------|--------------|-----------|
| `watchedTools`            | string[] | `["exec"]`   | Tools to watch for failures |
| `minFailuresBeforePivot`  | number   | `1`          | Failures required before injecting message |
| `promptTemplate`          | string   | (strong default) | Custom message template |

## Development

```bash
npm install
npm run build
```

## Why we use the Plugin SDK

Instead of manually exporting a function and guessing the API, this plugin uses the official `definePluginEntry` from `openclaw/plugin-sdk`. This provides:

- Proper TypeScript types
- Better long-term compatibility
- Official hook registration pattern

We do **not** publish this package to npm. It is intended to be installed via `git:` source.

## License

MIT
