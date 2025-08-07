FROM node:24

WORKDIR /app


COPY scripts/setup-docker.sh /init/
RUN chmod +x /init/setup-docker.sh

COPY apps/package.json ./
# COPY apps/package-lock.json ./


RUN npm install

RUN npm install -g typescript
RUN npm install -g concurrently
RUN npm install -g tsx
RUN npm install -g vite


# CMD ["tail", "-f", "/dev/null"]
CMD ["/init/setup-docker.sh"]
