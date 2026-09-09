import asyncio
from backend.scrapers.ota_scraper import scrape_ota

async def main():
    res = await scrape_ota("DEL", "BOM", "2026-10-05")
    print("Scraped:", res)

if __name__ == "__main__":
    asyncio.run(main())
