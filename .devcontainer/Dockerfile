FROM node:latest

RUN apt update
RUN apt install -y git curl

RUN curl -fsSL https://claude.ai/install.sh | bash
ENV PATH="/root/.local/bin:${PATH}"

ENV PYTHONDONTWRITEBYTECODE=1

#ENTRYPOINT ["uv", "run", "--watch", "--"]

ENTRYPOINT ["sh", "-c", "while true; do sleep 1; done"]
