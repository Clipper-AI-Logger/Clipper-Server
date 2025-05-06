docker-compose down
docker image prune -a
sudo docker volume rm clipper-server_static-files
docker-compose build --no-cache
docker-compose up -d