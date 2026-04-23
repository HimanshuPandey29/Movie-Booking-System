# Movie Booking System

A full-stack movie booking system built with Django.

## Features

- User registration and authentication
- Movie browsing and details
- Theatre and show management
- Seat booking with selection
- Payment processing (dummy)
- Booking history
- Notifications
- Admin panel for management

## Setup

1. Create virtual environment:
   ```
   python -m venv venv
   ```

2. Activate virtual environment:
   ```
   venv\Scripts\activate  # Windows
   ```

3. Install dependencies:
   ```
   pip install django pillow
   ```

4. Run migrations:
   ```
   python manage.py makemigrations
   python manage.py migrate
   ```

5. Create superuser:
   ```
   python manage.py createsuperuser
   ```

6. Run server:
   ```
   python manage.py runserver
   ```

## Project Structure

- `user/` - User management
- `movie/` - Movie management
- `theatre/` - Theatre and screen management
- `show/` - Show timings
- `booking/` - Seat booking
- `payment/` - Payment processing
- `notification/` - User notifications

## URLs

- Home: http://127.0.0.1:8000/movies/
- Admin: http://127.0.0.1:8000/admin/

## Technologies

- Django 6.0
- SQLite
- HTML/CSS/JavaScript