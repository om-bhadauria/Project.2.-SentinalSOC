FROM python:3.11-slim AS builder

WORKDIR /app
RUN apt-get update && apt-get install -y build-essential

COPY requirements.txt .
RUN pip install --user -r requirements.txt

FROM python:3.11-slim

WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .

ENV PATH=/root/.local/bin:$PATH
ENV HOST=0.0.0.0
ENV PORT=8000

EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
