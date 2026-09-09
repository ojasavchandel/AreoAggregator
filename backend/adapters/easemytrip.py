import asyncio
# pyrefly: ignore [missing-import]
from playwright.async_api import async_playwright
# pyrefly: ignore [missing-import]
from playwright_stealth import stealth_async
# pyrefly: ignore [missing-import]
from engine.simulation import generate_transparent_fallback
import re

async def scrape_ota(origin: str, destination: str, date: str) -> dict:
    ota_name = "EaseMyTrip"
    try:
        async def run_scrape():
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                try:
                    context = await browser.new_context(
                        user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
                    )
                    page = await context.new_page()
                    await stealth_async(page)
                    
                    # Aggressively block media and styles to speed up scraping
                    async def intercept_route(route):
                        if route.request.resource_type in ["image", "media", "font", "stylesheet"]:
                            await route.abort()
                        else:
                            await route.continue_()
                    
                    await page.route("**/*", intercept_route)
                    
                    url = f"https://www.easemytrip.com/flights?origin={origin}&destination={destination}&date={date}"
                    await page.goto(url, wait_until="domcontentloaded")
                    
                    locator = page.locator(".price, .fare, .amount").first
                    await locator.wait_for(timeout=5000)
                    price_text = await locator.inner_text()
                    
                    numeric_val = re.sub(r"[^\d]", "", price_text)
                    if not numeric_val:
                        raise ValueError("No numeric price found")
                    
                    base_fare = int(numeric_val)
                    convenience_fee = 0
                    promo_discount = 200
                    net_price = base_fare + convenience_fee - promo_discount
                    
                    return {
                        "ota_name": ota_name,
                        "base_fare": base_fare,
                        "convenience_fee": convenience_fee,
                        "promo_discount": promo_discount,
                        "net_price": net_price,
                        "status": "success"
                    }
                finally:
                    await browser.close()

        # Ironclad Fallback: 10 second timeout
        return await asyncio.wait_for(run_scrape(), timeout=10.0)
            
    except Exception as e:
        return generate_transparent_fallback(origin, destination, date, ota_name)
