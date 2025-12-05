FROM golang:1.22-alpine

WORKDIR /app
COPY run.sh /app/run.sh
RUN chmod +x /app/run.sh

ENTRYPOINT ["sh", "/app/run.sh"]
