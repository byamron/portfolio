---
name: link
description: >
  Start a dev server for testing. Use this PROACTIVELY after completing any
  feature implementation, bug fix, or code change — do not wait for the user
  to ask. Also use when the user explicitly requests a dev server or test link.
allowed-tools:
  - Bash
---

# /link — Start dev server and send test link

You are starting (or reconnecting to) a dev server for this workspace. Follow these steps:

## Step 1: Derive a deterministic port and check for conflicts

To avoid port collisions across parallel worktrees, compute a stable port from the current working directory, then verify no other worktree is using it.

Run this as a single bash command:

```bash
# Hash the workspace path to a port in range 3100–3999
PORT=$((3100 + $(echo -n "$PWD" | shasum | cut -c1-4 | xargs -I{} printf '%d' 0x{}) % 900))

# Check if something is already running on this port
PID=$(lsof -i :$PORT -t 2>/dev/null | head -1)

if [ -n "$PID" ]; then
  # Verify the process belongs to THIS workspace (not another worktree)
  PROC_CWD=$(lsof -a -p "$PID" -d cwd -Fn 2>/dev/null | grep '^n' | sed 's/^n//')
  if [ "$PROC_CWD" = "$PWD" ]; then
    echo "REUSE=$PORT"
  else
    # Port taken by a different workspace — find the next free port
    while lsof -i :$PORT -t >/dev/null 2>&1; do
      PORT=$((PORT + 1))
    done
    echo "START=$PORT"
  fi
else
  echo "START=$PORT"
fi
```

- If output is `REUSE=<port>`: a dev server for this workspace is already running. Skip to Step 3.
- If output is `START=<port>`: no server running. Proceed to Step 2.

## Step 2: Start the dev server

Run in the background using the port from Step 1:

```bash
npm run dev -- --port $PORT
```

Wait briefly, then confirm it started by checking the output for "ready" or "Local:".

## Step 3: Send the test link

End your message with the test link, formatted clearly:

```
Dev server: http://localhost:$PORT/
```

Replace `$PORT` with the actual port number. If you navigated to a specific route during implementation (e.g., a case study page), include that deep link too.
