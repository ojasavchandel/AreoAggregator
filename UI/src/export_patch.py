import re

with open('UI/src/App.jsx', 'r') as f:
    content = f.read()

# Import xlsx and Download icon
if "import * as XLSX" not in content:
    content = content.replace("import {", "import * as XLSX from 'xlsx';\nimport {", 1)

content = content.replace("CheckCircle2 } from 'lucide-react';", "CheckCircle2, Download } from 'lucide-react';")

# Insert handleExportExcel
export_fn = """
  const handleExportExcel = () => {
    if (!dashboardData) {
      alert("Please search for flights first to generate the report.");
      return;
    }
    
    const wsData = [];
    
    const processFlights = (flights, type) => {
      flights.forEach(f => {
        f.ota_breakdown.forEach(ota => {
          wsData.push({
            "Trip Type": type,
            "Airline": f.airline,
            "Flight Number": f.flight_number,
            "Departure Time": f.departure_time,
            "Arrival Time": f.arrival_time,
            "Duration": f.duration,
            "Stops": f.stops,
            "OTA Provider": ota.provider_name,
            "Base Fare (INR)": ota.base_fare,
            "Convenience Fee (INR)": ota.convenience_fee,
            "Promo Discount (INR)": ota.promo_discount,
            "Net Price (INR)": ota.net_price,
            "Is Cheapest OTA": ota.provider_name === f.cheapest_ota ? "Yes" : "No"
          });
        });
      });
    };
    
    processFlights(dashboardData.flights, "Departure");
    if (dashboardData.return_flights) {
      processFlights(dashboardData.return_flights, "Return");
    }
    
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Flight Pricing Data");
    
    XLSX.writeFile(wb, `AeroAggregator_Gov_Report_${date}.xlsx`);
  };

  return ("""

content = content.replace("  return (", export_fn)

# Replace "Top Deals" with "Export Gov Report"
top_deals_regex = re.compile(r'<div className="bg-white/10 text-slate-800 text-xs font-bold px-3 py-1\.5 rounded-full border border-slate-200 cursor-pointer hover:bg-white/20 transition">\s*Top Deals\s*</div>')
export_btn = """<div onClick={handleExportExcel} className={`text-xs font-bold px-3 py-1.5 rounded-full border cursor-pointer transition shadow-sm flex items-center gap-1 ${dashboardData ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'}`}>
              <Download className="w-3.5 h-3.5" /> Export Data (XLSX)
            </div>"""

content = top_deals_regex.sub(export_btn, content)

with open('UI/src/App.jsx', 'w') as f:
    f.write(content)

