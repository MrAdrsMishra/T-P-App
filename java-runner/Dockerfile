FROM eclipse-temurin:21-jdk-alpine

RUN apk add --no-cache dos2unix

RUN mkdir -p /app/work
WORKDIR /app/work

COPY run.sh /app/run.sh
RUN dos2unix /app/run.sh && chmod +x /app/run.sh

ENTRYPOINT ["sh", "/app/run.sh"]
