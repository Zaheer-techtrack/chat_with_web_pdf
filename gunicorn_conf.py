# gunicorn.conf.py

import os

# Set the path to the Unix socket file
socket_path = os.path.join(os.getcwd(), "chatpdf.sock")

# Gunicorn will bind to the Unix socket
bind = "unix:" + socket_path
#bind = '127.0.0.1:500'
# Number of worker processes for handling requests.
# A common choice is 2 * the number of CPU cores.
workers = 2

# The type of worker processes to spawn.
# "sync" is the default, but "gevent" or "eventlet" can be more efficient for certain applications.
worker_class = "sync"

# The maximum number of requests a worker will process before restarting.
# This helps prevent memory leaks and other issues.
max_requests = 1000

# The maximum number of requests a worker will process before terminating.
max_requests_jitter = 50

# Timeout for worker processes to gracefully exit.
timeout = 300

# Enable the ability to send the process SIGHUP to reload the application.
# This is useful for deploying new code without restarting Gunicorn.
reload = False

# Daemonize the Gunicorn process.
# When True, Gunicorn will run in the background as a daemon.
daemon = False

# Set the user and group used by worker processes.
# It's a good practice to run Gunicorn with a non-root user.
user = "www-data"
group = "www-data"

# Set the umask for worker processes.
umask = 0o007

# Logging configuration.
# You can customize the log format, file location, and other settings here.

# Set the log level (debug, info, warning, error, critical).
loglevel = "debug"

# Access log configuration
accesslog = os.path.join(os.getcwd(), "log", "gunicorn_access.log")

# Error log configuration
errorlog = os.path.join(os.getcwd(), "log", "gunicorn_error.log")

# If true, Gunicorn will run as a proxy behind another web server.
# Useful when using Gunicorn with a reverse proxy like Nginx or Apache.
proxy_protocol = False
