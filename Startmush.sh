#!/bin/bash
echo "--------------------- Welcome To ----------------------"
echo " __   __  ______    _______  _______  __   __  __   __" 
echo "|  | |  ||    _ |  |       ||   _   ||  |_|  ||  | |  |"
echo "|  | |  ||   | ||  |  _____||  |_|  ||       ||  | |  |"
echo "|  |_|  ||   |_||_ | |_____ |       ||       ||  |_|  |"
echo "|       ||    __  ||_____  ||       ||       ||       |"
echo "|       ||   |  | | _____| ||   _   || ||_|| ||       |"
echo "|_______||___|  |_||_______||__| |__||_|   |_||_______|"
echo 
echo "--- A Mext Generation Text Based Roleplaying Engine ---"
echo
echo "Loading the server.  Please wait ..."
nohup node ./index.js &> /dev/null &
echo "Server loaded.  Enjoy!"