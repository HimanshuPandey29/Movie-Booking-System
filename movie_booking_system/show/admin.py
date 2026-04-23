from django.contrib import admin
from .models import Show

@admin.register(Show)
class ShowAdmin(admin.ModelAdmin):
    list_display = ('movie', 'theatre', 'screen', 'show_time', 'price')
    list_filter = ('show_time', 'theatre')
