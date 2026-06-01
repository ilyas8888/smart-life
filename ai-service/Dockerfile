FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 7860
ENV OTEL_SERVICE_NAME=smartlife-ai-service \
    OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
    OTEL_TRACES_EXPORTER=otlp \
    OTEL_METRICS_EXPORTER=none \
    OTEL_LOGS_EXPORTER=none \
    OTEL_PYTHON_LOG_CORRELATION=true \
    OTEL_PYTHON_LOG_FORMAT="%(asctime)s %(levelname)s trace_id=%(otelTraceID)s span_id=%(otelSpanID)s %(name)s - %(message)s" \
    OTEL_PYTHON_FASTAPI_EXCLUDED_URLS=health
CMD ["opentelemetry-instrument", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
