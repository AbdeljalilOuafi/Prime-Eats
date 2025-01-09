#!/bin/bash

# Update package lists
sudo apt update -y

# Install necessary development tools and libraries
sudo apt install -y build-essential libssl-dev libmysqlclient-dev pkg-config
sudo apt install -y libpq-dev
sudo apt install -y redis-server
sudo apt install -y python3.10-dev
sudo apt install -y libmysqlclient-dev

# Start Redis (if not already running)
sudo service redis-server start

# Start Celery worker
celery -A core worker -l info
