# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install virtualenv
RUN pip install virtualenv

# Create and activate virtual environment
RUN virtualenv venv
ENV PATH="/app/venv/bin:$PATH"

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "run.py"]
