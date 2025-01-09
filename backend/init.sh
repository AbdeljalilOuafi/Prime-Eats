#!/bin/bash

pip install -r requirements.txt

# Update package lists
apt update -y

# Install necessary development tools and libraries
apt install -y build-essential libssl-dev libmysqlclient-dev pkg-config
apt install -y libpq-dev
apt install -y redis-server
apt install -y python3.10-dev
apt install -y libmysqlclient-dev


# Start Celery worker
celery -A core worker -l info --logfile=celery.log --detach
