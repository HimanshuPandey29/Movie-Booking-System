import json

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.urls import reverse
from .models import Booking
from show.models import Show

@login_required
def book_seats(request, show_id):
    show = get_object_or_404(Show, pk=show_id)
    
    if request.method == 'POST':
        seats = request.POST.getlist('seats')
        total_price = len(seats) * show.price
        booking = Booking.objects.create(
            user=request.user,
            show=show,
            seats=seats,
            total_price=total_price
        )
        messages.success(request, 'Booking created!')
        return redirect('payment:process', booking_id=booking.id)
    
    return render(request, 'booking/book_seats.html', {'show': show})

@login_required
def create_booking(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Invalid request method.'}, status=405)

    try:
        payload = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'message': 'Invalid JSON data.'}, status=400)

    show_id = payload.get('show_id')
    seats = payload.get('seats')
    total_price = payload.get('total_price')

    if not show_id or not seats or total_price is None:
        return JsonResponse({'success': False, 'message': 'Missing booking data.'}, status=400)

    show = get_object_or_404(Show, pk=show_id)
    booking = Booking.objects.create(
        user=request.user,
        show=show,
        seats=seats,
        total_price=total_price
    )

    return JsonResponse({
        'success': True,
        'booking_id': booking.id,
        'payment_url': reverse('payment:process', args=[booking.id])
    })

@login_required
def booking_history(request):
    bookings = Booking.objects.filter(user=request.user)
    return render(request, 'booking/history.html', {'bookings': bookings})

@login_required
def cancel_booking(request, pk):
    booking = get_object_or_404(Booking, pk=pk, user=request.user)
    if booking.status == 'pending':
        booking.status = 'cancelled'
        booking.save()
        messages.success(request, 'Booking cancelled!')
    return redirect('booking:history')
