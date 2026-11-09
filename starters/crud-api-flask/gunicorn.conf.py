# Gunicorn reads this file from the working directory. Four threads per process
# serve requests concurrently; they share the database pool (5 connections).
threads = 4
