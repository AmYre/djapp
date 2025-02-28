DC=docker-compose
APP=pong
BLOCKCHAIN_DIR=blockchain

all: up

build:
	$(DC) build

hardhat-clean:
	@echo "Please close the Hardhat node terminal window manually"
	cd $(BLOCKCHAIN_DIR) && rm -rf cache artifacts

hardhat-compile:
	cd $(BLOCKCHAIN_DIR) && npx hardhat compile

hardhat-node:
	@gnome-terminal -- bash -c "cd $(BLOCKCHAIN_DIR) && npx hardhat node; exec bash"
	@echo "Creating local test ETH with hardhat..."
	@sleep 5 # Wait for node to start

deploy-contract: hardhat-clean hardhat-compile hardhat-node
	cd $(BLOCKCHAIN_DIR) && npx hardhat run scripts/deploy.js --network localhost
	
up: deploy-contract
	$(DC) up --build

stop:
	$(DC) stop

start:
	$(DC) start

down: hardhat-clean
	$(DC) down --remove-orphans

admin:
	$(DC) exec $(APP) python manage.py createsuperuser

logs:
	$(DC) logs -f $(APP)

migrate:
	$(DC) exec $(APP) python manage.py makemigrations $(APP)
	$(DC) exec $(APP) python manage.py migrate
	

clean: hardhat-clean
	$(DC) down -v
	find . -type d -name "__pycache__" -exec rm -r {} +
	find . -type f -name "*.pyc" -delete

fclean: clean
	docker system prune -a -f --volumes

.PHONY: build up down logs shell migrate test clean ardhat-clean hardhat-compile hardhat-node deploy-contract

# Makefile error 130 is normal - exit code for quitting with ctrl+c signal
# added -d to up rule so containers run in detached mode - background - less verbose/ less error messages (take away -d for developing and debugging)
# use make stop or make down to pause or remove containers (instead of quitting with ctrl+c previously)
# exec not needed for rules with commands run outside of containers
# admin and migrate rules run inside running containers so exec is needed