# Order Orchestration Runbook

## Recovery Steps

### Order Stuck in Processing
1. Check order state in database
2. Verify payment status
3. Check inventory reservations
4. Manually transition state if needed
5. Compensate if payment processed but order failed

### Payment Processed but Order Failed
1. Verify payment transaction
2. Create order record manually
3. Release inventory if needed
4. Notify customer

### Inventory Reservation Failed
1. Check product stock levels
2. Release any partial reservations
3. Retry order creation
4. Notify customer of delay

