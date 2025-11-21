# MF-19: Filter Requirements Documentation

## Supported Filter Facets

### Categories
- Electronics
- Men's Clothing
- Women's Clothing
- Jewelry

### Price Range
- Min: $0
- Max: $1000+
- Default ranges: $0-50, $50-100, $100-200, $200+

### Sort Options
- Price: Low to High
- Price: High to Low
- Newest First (default)
- Rating: Highest First

## Redux State Structure

Current `ListReducer.js` stores:
- `ListItems`: Array of product objects
- Filter state needs to be added:
  - `selectedCategory`
  - `priceRange: { min, max }`
  - `sortBy`
  - `searchQuery`

## KPIs for Conversion
- Filter usage rate
- Products viewed after filtering
- Add-to-cart rate from filtered results
- Time to first filter application

