FROM python:3.11

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "python manage.py makemigrations dashboard && python manage.py migrate && python init_data.py && daphne -b 0.0.0.0 -p 8000 alfred_project.asgi:application"] 