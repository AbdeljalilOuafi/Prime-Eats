from celery import shared_task
from .utils import send_mail
from django.template.loader import render_to_string
from .models import Order
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


@shared_task
def send_order_confirmation_email(order_id, email):
    """
    Celery task to send order confirmation email
    """
    try:
        order = Order.objects.get(id=order_id)
        
        # Create email content
        subject = f"Order Confirmation #{order.id}"
        content = render_to_string('emails/order_confirmation.html', {
            'order': order,
        })
        
        # Send the email
        send_mail(email, subject, content)
        
        return True
    except Exception as e:
        # Log the error
        logger.error(f"Failed to send confirmation email for order {order_id}: {str(e)}")