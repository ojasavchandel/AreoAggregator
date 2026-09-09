import re

with open('backend/main.py', 'r') as f:
    content = f.read()

# Make sure we import Optional
if 'from typing import Dict, Any, Optional' not in content:
    content = content.replace('from typing import Dict, Any', 'from typing import Dict, Any, Optional')

# We'll completely replace the generate_flights and get_flights functions
new_logic = """def generate_flights(origin: str, dest: str, date_str: str, travel_class: str = "Economy", return_date: Optional[str] = None) -> Dict[str, Any]:
    # Use route and date to seed the random generator for consistency
    seed_str = f"{origin}-{dest}-{date_str}-{travel_class}"
    random.seed(seed_str)

    try:
        req_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        days_to_departure = (req_date - datetime.date.today()).days
        date_dd_mm_yyyy = req_date.strftime("%d/%m/%Y")
    except:
        days_to_departure = 14
        date_dd_mm_yyyy = date_str

    action = "🟢 BUY NOW" if days_to_departure <= 7 else "⏳ WAIT & WATCH"
    reason = "Fares are expected to remain stable. Book now to lock in the price." if days_to_departure <= 7 else f"Fares historically drop by 8–12% around 10 days before departure for {origin} ➔ {dest}."

    airlines = [
        {"name": "IndiGo", "code": "6E"},
        {"name": "Air India", "code": "AI"},
        {"name": "Vistara", "code": "UK"},
        {"name": "Akasa Air", "code": "QP"},
        {"name": "SpiceJet", "code": "SG"},
        {"name": "AIX Connect", "code": "IX"}
    ]

    base_price_min = random.randint(3000, 5000)
    
    multiplier = 1.0
    if travel_class.lower() == "premium economy":
        multiplier = 1.8
    elif travel_class.lower() == "business":
        multiplier = 3.5
        
    base_price_min = int(base_price_min * multiplier)

    # Generate OTA URLs
    class_code_emt = "E"
    class_code_mmt = "E"
    if travel_class.lower() == "business":
        class_code_emt = "B"
        class_code_mmt = "B"
    elif travel_class.lower() == "premium economy":
        class_code_emt = "PE"
        class_code_mmt = "PE"

    emt_url = f"https://flight.easemytrip.com/FlightList/Index?srch={origin}-India|{dest}-India|{date_dd_mm_yyyy}&px=1-0-0&ccls={class_code_emt}"
    mmt_url = f"https://www.makemytrip.com/flight/search?itinerary={origin}-{dest}-{date_dd_mm_yyyy}&tripType=O&paxType=A-1_C-0_I-0&intl=false&cabinClass={class_code_mmt}"
    yatra_url = f"https://flight.yatra.com/air-search-ui/dom2/trigger?type=O&viewName=normal&flexi=0&noOfSegments=1&origin={origin}&originCountry=IN&destination={dest}&destinationCountry=IN&flight_depart_date={date_dd_mm_yyyy}&ADT=1&CHD=0&INF=0&class={class_code_mmt}"
    ixigo_url = f"https://www.ixigo.com/search/result/flight?from={origin}&to={dest}&date={date_dd_mm_yyyy}&returnDate=&adults=1&children=0&infants=0&class=e"
    cleartrip_url = f"https://www.cleartrip.com/flights/results?adults=1&childs=0&infants=0&class={class_code_mmt}&depart_date={date_dd_mm_yyyy}&from={origin}&to={dest}"
    goibibo_url = f"https://www.goibibo.com/flights/flight-search/?route={origin}-{dest}-{date_dd_mm_yyyy}&adults=1&children=0&infants=0&seatingclass={class_code_mmt}"

    ota_templates = [
        {"name": "EaseMyTrip", "badge": "Zero Convenience Fee", "cf_range": (0, 0), "promo_range": (150, 300), "url": emt_url},
        {"name": "Yatra", "badge": "Bank Offers", "cf_range": (350, 450), "promo_range": (300, 500), "url": yatra_url},
        {"name": "MakeMyTrip", "badge": "Popular & Reliable", "cf_range": (350, 400), "promo_range": (200, 350), "url": mmt_url},
        {"name": "Cleartrip", "badge": "Fast Booking", "cf_range": (300, 400), "promo_range": (150, 250), "url": cleartrip_url},
        {"name": "Goibibo", "badge": "GoCash Cashback", "cf_range": (350, 420), "promo_range": (250, 300), "url": goibibo_url},
        {"name": "Ixigo", "badge": "Low Cancellation Fee", "cf_range": (250, 320), "promo_range": (150, 250), "url": ixigo_url}
    ]

    flights = []
    global_lowest_fare = float('inf')
    global_max_spread = 0

    for i in range(1, 11):
        airline = random.choice(airlines)
        flight_number = f"{airline['code']}-{random.randint(100, 2999)}"
        
        dep_hour = random.randint(0, 23)
        dep_minute = random.choice([0, 10, 15, 20, 30, 40, 45, 50])
        dep_time_str = f"{dep_hour:02d}:{dep_minute:02d}"
        
        dur_hrs = random.randint(1, 5)
        dur_mins = random.choice([0, 15, 20, 30, 45, 50])
        
        arr_hour = (dep_hour + dur_hrs + (dep_minute + dur_mins) // 60) % 24
        arr_minute = (dep_minute + dur_mins) % 60
        arr_time_str = f"{arr_hour:02d}:{arr_minute:02d}"

        if 0 <= dep_hour < 6:
            dep_period = "early"
        elif 6 <= dep_hour < 12:
            dep_period = "morning"
        elif 12 <= dep_hour < 18:
            dep_period = "afternoon"
        else:
            dep_period = "night"

        stops = random.choice(["Non-stop", "Non-stop", "1 Stop (HYD)", "1 Stop (BLR)", "1 Stop (DEL)"])
        
        base_fare = base_price_min + int(random.randint(0, 3000) * multiplier)
        
        ota_breakdown = []
        for ota in ota_templates:
            cf = random.randint(ota["cf_range"][0], ota["cf_range"][1])
            promo = random.randint(ota["promo_range"][0], ota["promo_range"][1])
            net = base_fare + cf - promo
            ota_breakdown.append({
                "provider_name": ota["name"],
                "badge": ota["badge"],
                "base_fare": base_fare,
                "convenience_fee": cf,
                "promo_discount": promo,
                "net_price": net,
                "booking_url": ota["url"]
            })

        ota_breakdown.sort(key=lambda x: x["net_price"])
        lowest_price = ota_breakdown[0]["net_price"]
        highest_price = ota_breakdown[-1]["net_price"]
        cheapest_ota = ota_breakdown[0]["provider_name"]
        
        spread = highest_price - lowest_price
        savings = ota_breakdown[1]["net_price"] - lowest_price if len(ota_breakdown) > 1 else spread

        global_lowest_fare = min(global_lowest_fare, lowest_price)
        global_max_spread = max(global_max_spread, spread)

        flights.append({
            "id": f"fl-{i}",
            "airline": airline["name"],
            "airline_code": airline["code"],
            "flight_number": flight_number,
            "departure_time": dep_time_str,
            "arrival_time": arr_time_str,
            "duration": f"{dur_hrs}h {dur_mins}m",
            "stops": stops,
            "departure_period": dep_period,
            "lowest_price": lowest_price,
            "cheapest_ota": cheapest_ota,
            "savings_vs_others": savings,
            "ota_breakdown": ota_breakdown
        })
        
    trend_points = [global_lowest_fare + random.randint(int(-500 * multiplier), int(1500 * multiplier)) for _ in range(14)]
    
    response = {
        "route": f"{origin} ➔ {dest}",
        "date": date_str,
        "analytics": {
            "action": action,
            "reason": reason,
            "lowest_fare": global_lowest_fare,
            "max_spread": global_max_spread,
            "trend_points": trend_points
        },
        "flights": flights
    }
    
    if return_date:
        # Generate return flights by swapping origin and dest, and using return_date
        return_response = generate_flights(dest, origin, return_date, travel_class)
        response["return_flights"] = return_response["flights"]
        response["return_date"] = return_date
        response["route"] = f"{origin} ⮂ {dest}"
        
    return response

@app.get("/api/flights")
async def get_flights(origin: str, destination: str, date: str, travel_class: str = "Economy", return_date: Optional[str] = None):
    return generate_flights(origin, destination, date, travel_class, return_date)"""

# Use regex to replace the function entirely
content = re.sub(r'def generate_flights.*?$', new_logic, content, flags=re.DOTALL)

with open('backend/main.py', 'w') as f:
    f.write(content)
