 FROM node:24 AS base

#install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install -g typescript
RUN npm install

WORKDIR /app

COPY scripts/setup-docker.sh /init/
RUN chmod +x /init/setup-docker.sh

# COPY apps/package.json ./
# COPY apps/package-lock.json ./





# CMD ["tail", "-f", "/dev/null"]
CMD ["/init/setup-docker.sh"]

# Multi stage build test
# FROM node:24 AS base

# #install dependencies
# FROM base AS deps
# WORKDIR /app
# COPY package.json package-lock.json ./
# RUN npm install -g typescript
# RUN npm install


# # build the project
# FROM base AS build
# WORKDIR /app
# COPY . .
# RUN npm run build

# FROM base
# WORKDIR /app
# COPY --from=deps /app/node_modules /app/node_modules
# COPY --from=build /app/dist /app/dist

# ENV NODE_ENV=production
# ENV APP_MODE=production

# CMD ["sh", "-c", "if [ \"$APP_MODE\" = 'development' ]; then npm run dev; else node dist/backend/server.js; fi"]


