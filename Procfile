web: gunicorn -k uvicorn.workers.UvicornWorker -w 2 --access-logfile - --log-level info -b 0.0.0.0:$PORT main:app
