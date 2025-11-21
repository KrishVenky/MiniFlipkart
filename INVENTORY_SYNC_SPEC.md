# MF-49: Inventory Sync Specification

## Sync Cadence
- Real-time: On order placement
- Batch: Every 15 minutes
- Full sync: Daily at 2 AM

## Thresholds
- Low stock alert: < 10 units
- Critical stock: < 5 units
- Out of stock: 0 units

## Alert Routing
- Low stock: Email to inventory manager
- Critical stock: Email + SMS
- Out of stock: Email + SMS + Dashboard notification

