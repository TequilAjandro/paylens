## ------------------------------- Builder Stage ------------------------------ ##
FROM python:3.12-bookworm AS builder

# Install uv
ADD https://astral.sh/uv/install.sh /uv-installer.sh
RUN chmod +x /uv-installer.sh && sh /uv-installer.sh && rm /uv-installer.sh

ENV PATH="/root/.local/bin:${PATH}"

WORKDIR /app

COPY pyproject.toml uv.lock ./

RUN uv sync --locked --no-install-project

## ------------------------------- Production Stage ------------------------------ ##
FROM python:3.12-slim-bookworm AS production

RUN useradd --create-home appuser

WORKDIR /app

COPY . /app
COPY --from=builder /app/.venv .venv

ENV VIRTUAL_ENV=/app/.venv
ENV PATH="/app/.venv/bin:$PATH"

RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
