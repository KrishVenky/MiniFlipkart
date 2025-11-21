# MF-43: Order Orchestration Blueprint

## Order State Machine
- **pending** → **processing** → **shipped** → **delivered**
- **pending** → **cancelled** (user/admin action)
- **processing** → **cancelled** (with compensation)

## Idempotency
- Use idempotency key in request header
- Store idempotency key with order
- Return existing order if key matches

## SLA Targets
- Order creation: < 2 seconds
- Payment processing: < 5 seconds
- Inventory reservation: < 1 second
- Total orchestration: < 10 seconds

