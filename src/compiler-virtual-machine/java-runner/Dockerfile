FROM openjdk:26-ea-jdk

RUN apt-get update && apt-get install -y dos2unix && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY run.sh /app/run.sh
RUN dos2unix /app/run.sh && chmod +x /app/run.sh

ENTRYPOINT ["sh", "/app/run.sh"]
