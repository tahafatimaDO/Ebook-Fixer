FROM python:3.10-alpine3.14

ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt ./

RUN pip install -r requirements.txt --quiet && \
    apk add --no-cache bash && \
    apk add git

COPY . ./

EXPOSE 8000