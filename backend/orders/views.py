from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db import transaction
from decimal import Decimal
from .models import Order, OrderItem
from restaurants.models import Restaurant, MenuItem

class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            restaurant_id = request.data.get('restaurant_id')
            items = request.data.get('items', [])
            coupon_code = request.data.get('coupon_code')  # Get coupon code from request

            try:
                restaurant = Restaurant.objects.get(id=restaurant_id)
            except Restaurant.DoesNotExist:
                return Response({"error": "Restaurant not found"}, status=status.HTTP_404_NOT_FOUND)

            order_items_data = []
            total_amount = Decimal('0.00')

            for item in items:
                try:
                    menu_item = MenuItem.objects.get(id=item['item_id'], is_available=True)
                except MenuItem.DoesNotExist:
                    return Response(
                        {"error": f"Menu item with id {item['item_id']} not found or not available"},
                        status=status.HTTP_404_NOT_FOUND
                    )

                quantity = int(item['quantity'])
                if quantity <= 0:
                    return Response(
                        {"error": "Quantity must be positive"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                item_total = menu_item.price * quantity
                total_amount += item_total

                order_items_data.append({
                    'menu_item': menu_item,
                    'quantity': quantity,
                    'unit_price': menu_item.price,
                    'total_price': item_total
                })

            # Store original amount before discount
            original_amount = total_amount

            # Apply coupon code if valid
            is_demo_order = coupon_code == "ALX"
            if is_demo_order:
                # Set to minimum amount for PayPal testing (e.g., $0.01)
                total_amount = Decimal('0.01')

            with transaction.atomic():
                order = Order.objects.create(
                    user=request.user,
                    restaurant=restaurant,
                    total_amount=total_amount,
                    original_amount=original_amount,  # Store original amount
                    status='pending',
                    is_paid=False,
                    coupon_code=coupon_code if is_demo_order else None
                )

                order_items = [
                    OrderItem(
                        order=order,
                        menu_item=item_data['menu_item'],
                        quantity=item_data['quantity'],
                        unit_price=item_data['unit_price'],
                        total_price=item_data['total_price']
                    )
                    for item_data in order_items_data
                ]
                OrderItem.objects.bulk_create(order_items)

            return Response({
                "message": "Order created successfully",
                "order_id": order.id,
                "original_amount": original_amount,
                "final_amount": total_amount,
                "status": order.status,
                "is_paid": order.is_paid,
                "coupon_applied": is_demo_order
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"error": f"An error occurred while creating the order: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )