## run from root directory

# Requires pm2 to run in detatched mode. Otherwise you can run in seperate consoles.
# install pm2 with: `sudo npm install pm2 -g`
# Is it easier to just run them manually? Maybe. Does pm2 make me feel cool? Yes.

# start the datbase
docker start exc_container

# start the server
cd ./server
pm2 start npm --name server -- run dev

# start the client
cd ../client