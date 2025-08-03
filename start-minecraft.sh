#!/bin/bash

# https://docs.papermc.io/misc/tools/start-script-gen/
# Try without flags when using JVM from 17, 21 or higher.
# Otherwise, try Jaikar's flags from URL above

exec java -Xms8192M -Xmx8192M -jar paper.jar nogui
