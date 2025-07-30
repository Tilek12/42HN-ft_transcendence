FROM node:24

WORKDIR /app


COPY ./app/ ./
COPY scripts/setup-docker.sh /init/
RUN chmod +x /init/setup-docker.sh
RUN npm install ci
# RUN npm ci -g typescript concurrently tsx vite

EXPOSE 8080 3000

# CMD ["tail", "-f", "/dev/null"]
CMD ["/init/setup-docker.sh"]
