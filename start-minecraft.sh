#!/bin/bash

# Capture PID and redirect output
touch server.pid

# https://docs.papermc.io/misc/tools/start-script-gen/
# Try without flags when using JVM from 17, 21 or higher.
# Otherwise, try the flags below, adjusting the first two RAM params

# exec java -Xms1G -Xmx1G \
#   -XX:+UseG1GC \
#   -XX:+ParallelRefProcEnabled \
#   -XX:MaxGCPauseMillis=200 \
#   -XX:+UnlockExperimentalVMOptions \
#   -XX:+DisableExplicitGC \
#   -XX:+AlwaysPreTouch \
#   -XX:G1NewSizePercent=30 \
#   -XX:G1MaxNewSizePercent=40 \
#   -XX:G1HeapRegionSize=8M \
#   -XX:G1ReservePercent=20 \
#   -XX:G1MixedGCCountTarget=4 \
#   -XX:InitiatingHeapOccupancyPercent=15 \
#   -XX:G1MixedGCLiveThresholdPercent=90 \
#   -XX:G1RSetUpdatingPauseTimePercent=5 \
#   -XX:G1HeapWastePercent=5 \
#   -XX:+PerfDisableSharedMem \
#   -XX:MaxTenuringThreshold=1 \
#   -Dusing.aikars.flags=https://mcflags.emc.gs \
#   -Daikars.new.flags=true \
#   -jar paper.jar --nogui

exec java -Xms16384M -Xmx16384M -jar paper.jar nogui
