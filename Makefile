DC=docker-compose
APP=pong


all: up

build:
	$(DC) build

up:
	exec $(DC) up --build

stop:
	$(DC) stop

down:
	$(DC) down --remove-orphans

logs:
	$(DC) logs -f $(APP)

migrate:
	$(DC) exec $(APP) python manage.py makemigrations $(APP)
	$(DC) exec $(APP) python manage.py migrate

clean:
	$(DC) down -v
	find . -type d -name "__pycache__" -exec rm -r {} +
	find . -type f -name "*.pyc" -delete

fclean: clean
	docker system prune -a -f --volumes

.PHONY: build up down logs shell migrate test clean