from django.db import models

class Theatre(models.Model):
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=200)

    def __str__(self):
        return self.name

class Screen(models.Model):
    theatre = models.ForeignKey(Theatre, on_delete=models.CASCADE)
    screen_number = models.IntegerField()
    total_seats = models.IntegerField()

    def __str__(self):
        return f"{self.theatre.name} - Screen {self.screen_number}"
