#!/usr/bin/env python3
"""utils module"""

import resend
from decouple import config
from orders.models import Order
from django.template.loader import render_to_string

def send_mail(order_id, email):
  
  resend.api_key = config('RESEND_API_KEY')
  
  try:
    
      order = Order.objects.get(id=order_id)
      
      # Create email content
      subject = f"Order Confirmation #{order.id}"
      content = render_to_string('emails/order_confirmation.html', {
          'order': order,
      })
      
      # Send the email
      r = resend.Emails.send({
        "from": "PrimeEats@primeeats.live",
        "to": email,
        "subject": subject,
        "html": content
      })
      
      return True
  except Exception as e:
      # Log the error
      print(f"Failed to send confirmation email for order {order_id}: {str(e)}")

