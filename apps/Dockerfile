FROM node:24

WORKDIR /app


COPY scripts/setup-docker.sh /init/
RUN chmod +x /init/setup-docker.sh

EXPOSE 8080

# CMD ["tail", "-f", "/dev/null"]
CMD ["/init/setup-docker.sh"]
