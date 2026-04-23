"""
Utility functions for currency conversion and formatting
"""

# Exchange rate: 1 USD = INR
USD_TO_INR = 83

def convert_usd_to_inr(usd_amount):
    """Convert USD amount to INR"""
    return round(usd_amount * USD_TO_INR, 2)

def convert_inr_to_usd(inr_amount):
    """Convert INR amount to USD"""
    return round(inr_amount / USD_TO_INR, 2)

def format_currency(amount, currency='USD'):
    """Format amount with currency symbol"""
    if currency.upper() == 'USD':
        return f"${amount:.2f}"
    elif currency.upper() == 'INR':
        return f"₹{amount:.2f}"
    return f"{amount:.2f}"

def get_dual_currency(amount, from_currency='INR'):
    """
    Get amount in both USD and INR
    Args:
        amount: The amount to convert
        from_currency: The source currency (default: 'INR')
    Returns:
        dict with 'usd' and 'inr' keys
    """
    if from_currency.upper() == 'INR':
        usd_amount = convert_inr_to_usd(amount)
        inr_amount = amount
    else:
        usd_amount = amount
        inr_amount = convert_usd_to_inr(amount)
    
    return {
        'usd': round(usd_amount, 2),
        'inr': round(inr_amount, 2),
        'usd_formatted': format_currency(usd_amount, 'USD'),
        'inr_formatted': format_currency(inr_amount, 'INR'),
    }
