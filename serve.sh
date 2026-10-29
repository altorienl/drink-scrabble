#!/bin/sh
# Serve the game locally. Classic <script src> tags work from file:// too, but a
# real server avoids any browser file:// quirks.
PORT="${1:-8731}"
cd "$(dirname "$0")" || exit 1
echo "Drink Scrabble -> http://localhost:$PORT"
exec python3 -m http.server "$PORT" --bind 127.0.0.1
