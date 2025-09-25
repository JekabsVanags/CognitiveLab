#!/bin/bash

# Start MySQL temporarily
mysqld --skip-networking &
MYSQL_PID=$!

# Wait for MySQL to start
sleep 5

# Set root password and create database
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'password';"
mysql -uroot -ppassword -e "CREATE DATABASE IF NOT EXISTS cognitive_sleep_test;"

# Kill temporary MySQL process
kill $MYSQL_PID
wait $MYSQL_PID 2>/dev/null
