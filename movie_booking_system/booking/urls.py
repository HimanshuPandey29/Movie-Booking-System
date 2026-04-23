from django.urls import path
from . import views

app_name = 'booking'

urlpatterns = [
    path('book/<int:show_id>/', views.book_seats, name='book_seats'),
    path('create/', views.create_booking, name='create'),
    path('history/', views.booking_history, name='history'),
    path('cancel/<int:pk>/', views.cancel_booking, name='cancel'),
]