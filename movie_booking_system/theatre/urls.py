from django.urls import path
from . import views

app_name = 'theatre'

urlpatterns = [
    path('', views.theatre_list, name='list'),
]