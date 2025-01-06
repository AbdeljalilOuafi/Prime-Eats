#!/bin/bash

# Start Redis (if not already running)
sudo service redis-server start 

# Start Celery worker
celery -A core worker -l info