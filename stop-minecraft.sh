#!/bin/bash

if [ -f server.pid ]; then
    PID=$(cat server.pid)
    if ps -p $PID > /dev/null; then
        # Send stop command to Minecraft server through screen
        echo "Sending stop command to Minecraft server..."
        kill -SIGTERM $PID

        # Wait for up to 30 seconds for graceful shutdown
        WAIT_TIME=0
        while ps -p $PID > /dev/null && [ $WAIT_TIME -lt 30 ]; do
            sleep 1
            WAIT_TIME=$((WAIT_TIME + 1))
        done

        # Force kill if still running
        if ps -p $PID > /dev/null; then
            echo "Server didn't shut down gracefully. Force killing..."
            kill -9 $PID
        fi

        rm server.pid
        echo "Server stopped successfully"
        exit 0
    else
        echo "Server process not found"
        rm server.pid
        exit 1
    fi
else
    echo "PID file not found"
    exit 1
fi
