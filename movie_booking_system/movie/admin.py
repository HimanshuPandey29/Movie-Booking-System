from django.contrib import admin
from .models import Movie

@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ('title', 'genre', 'release_date', 'duration')
    search_fields = ('title', 'genre')
    list_filter = ('genre','title')

# admin.site.register(Movie)