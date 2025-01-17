FROM python:3.9-slim

RUN apt-get update && apt-get install -y \
	gcc \
	python3-dev \
	libpq-dev \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt /app/
RUN pip install -r requirements.txt

RUN pip install django-browser-reload

COPY . /app/

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]