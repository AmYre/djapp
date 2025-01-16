# TRANSCENDENCE

## Prérequis

-   Docker
-   Docker Compose

## Installation

1. Clonez le dépôt :

```bash
git clone [URL_DE_VOTRE_DEPOT]
cd [NOM_DU_PROJET]
```

2. Construisez et démarrez les conteneurs :

```bash
docker-compose up --build
```

L'application sera accessible à l'adresse : http://localhost:8000

## Configuration

Les variables d'environnement par défaut sont définies dans le `docker-compose.yml`. Pour les personnaliser, créez un fichier `.env` à la racine du projet.

## Base de données

PostgreSQL est utilisé comme base de données. Les données sont persistées dans un volume Docker.

Pour créer un superutilisateur :

```bash
docker-compose exec web python manage.py createsuperuser
```

## Développement

Pour exécuter des commandes Django :

```bash
docker-compose exec web python manage.py [COMMANDE]
```
