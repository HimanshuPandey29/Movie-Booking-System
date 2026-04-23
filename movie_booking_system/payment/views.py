from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Payment
from booking.models import Booking

@login_required
def process_payment(request, booking_id):
    booking = get_object_or_404(Booking, pk=booking_id, user=request.user)
    
    if request.method == 'POST':
        payment_method = request.POST.get('payment_method')

        if not payment_method:
            messages.error(request, 'Please select a payment method!')
            return redirect('payment:process_payment', booking_id=booking.id)

 
        payment = Payment.objects.create(
            booking=booking,
            amount=booking.total_price,
            status='success',
            payment_method=payment_method
        )
        booking.status = 'confirmed'
        booking.save()
        messages.success(request, 'Payment successful!')
        return redirect('booking:history')
    
    return render(request, 'payment/process.html', {'booking': booking})

@login_required
def payment_history(request):
    payments = Payment.objects.filter(booking__user=request.user)
    return render(request, 'payment/history.html', {'payments': payments})
