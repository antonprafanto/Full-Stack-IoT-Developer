# Dockerfile - the Module 26 Level 3 answer key: the device simulator's image (mold) from the tools/ folder.
# One stage only: tools/ has no build step (Node runs the .js files directly), and its libraries are only mqtt +
# socket.io-client, so the image is already small without a second stage.
# Put this file at tools/Dockerfile (together with tools/.dockerignore). Built by Compose: the simulator service in
# compose.simulation.yml (build: ./tools).

# An exact tag, the same as the backend and web images.
FROM node:24.22.1-alpine3.24
WORKDIR /app
# the library list first, the code later (the npm ci layer cache, the same as backend/Dockerfile)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY *.js ./
# the simulator keeps the fake devices' "NVS" in data/simulator-store.json. The /app folder belongs to root, so the data/
# folder is made here and handed to the user node; without it the simulator fails to write (EACCES) when it gets a config command.
RUN mkdir data && chown node:node data
USER node
# The list (exec) form, not "npm start". The simulator doesn't handle the SIGTERM signal, and Node as PID 1 ignores it:
# that's why the simulator service in compose.simulation.yml uses "init: true". The broker address and the number of devices are written
# in compose.simulation.yml (command), not here.
CMD ["node", "device-simulator.js"]
