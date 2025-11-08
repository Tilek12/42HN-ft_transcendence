 FROM node:25

WORKDIR	/app

COPY	scripts/setup-docker.sh /init/
RUN		chmod +x /init/setup-docker.sh
CMD ["/init/setup-docker.sh"]
