from django.db import models

class Movie(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    duration = models.IntegerField(help_text="Duration in minutes")
    genre = models.CharField(max_length=100)
    release_date = models.DateField()
    poster = models.ImageField(upload_to='movie_posters/', blank=True)

    def __str__(self):
        return self.title
