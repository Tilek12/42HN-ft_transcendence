FROM node:24

WORKDIR /app


COPY scripts/setup-docker.sh /init/
RUN chmod +x /init/setup-docker.sh

# COPY apps/package.json ./
# COPY apps/package-lock.json ./





# CMD ["tail", "-f", "/dev/null"]
CMD ["/init/setup-docker.sh"]
