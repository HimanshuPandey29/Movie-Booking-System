from django.shortcuts import render
from .models import Theatre

def theatre_list(request):
    theatres = Theatre.objects.all()
    return render(request, 'theatre/list.html', {'theatres': theatres})
