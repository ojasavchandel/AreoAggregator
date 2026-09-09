import re

with open('backend/main.py', 'r') as f:
    content = f.read()

# Add PRICE_CACHE
if 'PRICE_CACHE =' not in content:
    content = content.replace('app = FastAPI(title="Aero UI Flight API")', 'app = FastAPI(title="Aero UI Flight API")\n\nPRICE_CACHE = {}')

# Update generate_flights to be async
content = content.replace('def generate_flights(', 'async def generate_flights(')

# Inject live scraping logic where base_price_min is defined
scrape_logic = """    cache_key = f"{origin}-{dest}-{date_str}"
    if cache_key in PRICE_CACHE:
        real_base = PRICE_CACHE[cache_key]
    else:
        try:
            from scrapers.ota_scraper import scrape_ota
            res = await scrape_ota(origin, dest, date_str)
            real_base = res.get("base_fare", 5000)
        except Exception:
            real_base = random.randint(4000, 7000)
        PRICE_CACHE[cache_key] = real_base
        
    base_price_min = max(2000, real_base - 800)"""

content = re.sub(r'    base_price_min = random\.randint\(3000, 5000\)', scrape_logic, content)

# Await the recursive call for return flights
content = content.replace('return_response = generate_flights(', 'return_response = await generate_flights(')

# Await in the GET endpoint
content = content.replace('return generate_flights(', 'return await generate_flights(')

with open('backend/main.py', 'w') as f:
    f.write(content)
