# MF-37: Checkout Requirements

## Checkout Steps
1. Cart Review
2. Shipping Address
3. Payment Method
4. Order Confirmation

## Dependencies
- Cart API: `/api/cart`
- Payment API: `/api/payment`
- Orders API: `/api/orders`

## Rollback Scenarios
- Payment failure → Restore cart
- Address validation failure → Return to address step
- Network error → Save progress, allow resume

