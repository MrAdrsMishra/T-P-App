FROM python:3.12-alpine

RUN apk add --no-cache dos2unix

WORKDIR /app
COPY run.sh /app/run.sh
RUN dos2unix /app/run.sh && chmod +x /app/run.sh

ENTRYPOINT ["sh", "/app/run.sh"]
