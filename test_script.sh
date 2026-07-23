#!/bin/bash
# Start backend in background
cd backend
venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 &
PID=$!
# Wait for it to start
sleep 3
# Send request
curl -v -X POST http://127.0.0.1:8000/api/designs/generate \
-H "Content-Type: application/json" \
-d '{"designType": "INTERIOR", "spaceType": "LIVING_ROOM", "budget": 1000, "currency": "USD", "style": "MODERN", "location": {"city": "New York", "country": "US"}, "selectedItems": [{"itemType": "sofa"}], "description": "A cozy living room"}'

# Wait to see if process crashes
sleep 2
kill $PID
