#!/bin/bash
# Watchdog: keep Next.js dev server alive on port 3000
cd /home/z/my-project
while true; do
  if ! ss -tln 2>/dev/null | grep -q ':3000'; then
    # Port down — restart
    pkill -f 'next-server' 2>/dev/null
    pkill -f 'next dev' 2>/dev/null
    sleep 1
    bun run dev >> dev.log 2>&1 &
    echo "[watchdog] restarted at $(date)" >> dev.log
  fi
  sleep 10
done
