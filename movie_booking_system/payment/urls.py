from django.urls import path
from . import views

app_name = 'payment'

urlpatterns = [
    path('process/<int:booking_id>/', views.process_payment, name='process'),
    path('history/', views.payment_history, name='history'),
]