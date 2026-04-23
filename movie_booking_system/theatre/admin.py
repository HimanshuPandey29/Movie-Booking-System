from django.contrib import admin
from .models import Theatre, Screen

@admin.register(Theatre)
class TheatreAdmin(admin.ModelAdmin):
    list_display = ('name', 'location')

@admin.register(Screen)
class ScreenAdmin(admin.ModelAdmin):
    list_display = ('theatre', 'screen_number', 'total_seats')

