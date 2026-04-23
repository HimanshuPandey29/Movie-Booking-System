from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('user', 'show', 'total_price', 'status', 'booking_time')
    list_filter = ('status', 'booking_time')



    
