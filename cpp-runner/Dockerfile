FROM gcc:latest

RUN apt-get update && apt-get install -y dos2unix && rm -rf /var/lib/apt/lists/*
RUN mkdir -p /app/work
WORKDIR /app/work

COPY run.sh /app/run.sh
RUN dos2unix /app/run.sh && chmod +x /app/run.sh

ENTRYPOINT ["sh", "/app/run.sh"]
 