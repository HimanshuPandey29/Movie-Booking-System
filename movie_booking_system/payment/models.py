from django.db import models
from booking.models import Booking

class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
    ]

    PAYMENT_METHOD = [
        ('UPI ', 'UPI'),
        ('NET Banking', 'NET Banking'),
        ('DEBIT Card', 'DEBIT Card'),
        ('CREDIT Card', 'CREDIT Card'),
    ]
    
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=50,choices=PAYMENT_METHOD)
    payment_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment for {self.booking} - {self.status}"
