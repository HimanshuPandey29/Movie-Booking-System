from django.shortcuts import render
from .models import Show

def show_list(request):
    shows = Show.objects.all()
    movie_id = request.GET.get('movie')
    theatre_id = request.GET.get('theatre')
    if movie_id:
        shows = shows.filter(movie_id=movie_id)
    if theatre_id:
        shows = shows.filter(theatre_id=theatre_id)
    return render(request, 'show/list.html', {'shows': shows})
