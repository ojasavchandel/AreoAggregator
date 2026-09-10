import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Plane, AlertCircle, ArrowDownUp, RefreshCw, CheckCircle2, Info, Navigation, Search, MapPin, Calendar, Clock, ArrowRight, Zap, TrendingDown, Bell, Filter, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import FlightCanvas from './components/FlightCanvas';


export default function App() {
  const [origin, setOrigin] = useState('DEL');
  const [destination, setDestination] = useState('BOM');
  const [date, setDate] = useState('2026-09-30');
  const [flightClass, setFlightClass] = useState('Economy');
  const [tripType, setTripType] = useState('One Way');
  const [returnDate, setReturnDate] = useState('2026-10-05');
  const [viewingReturn, setViewingReturn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showArchitecture, setShowArchitecture] = useState(false);

  // Filters
  const [stopsFilter, setStopsFilter] = useState([]);
  const [depPeriodFilter, setDepPeriodFilter] = useState([]);
  const [airlinesFilter, setAirlinesFilter] = useState([]);
  const [maxPrice, setMaxPrice] = useState(20000);
  const [sortBy, setSortBy] = useState('Cheapest First');

  const [expandedFlightId, setExpandedFlightId] = useState(null);

  const fetchFlights = async (o = origin, d = destination, dt = date, cls = flightClass, type = tripType, rDate = returnDate) => {
    setLoading(true);
    setDashboardData(null);
    setExpandedFlightId(null);
    setViewingReturn(false);
    try {
      let url = `http://localhost:8000/api/flights?origin=${o}&destination=${d}&date=${dt}&travel_class=${cls}`;
      if (type === 'Round Trip') url += `&return_date=${rDate}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setDashboardData(data);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoutePillClick = (o, d) => {
    setOrigin(o);
    setDestination(d);
    fetchFlights(o, d, date);
  };

  const resetFilters = () => {
    setStopsFilter([]);
    setDepPeriodFilter([]);
    setAirlinesFilter([]);
    setMaxPrice(20000);
  };

  const handleToggleStops = (stop) => {
    setStopsFilter(prev => prev.includes(stop) ? prev.filter(s => s !== stop) : [...prev, stop]);
  };
  const handleToggleDepPeriod = (period) => {
    setDepPeriodFilter(prev => prev.includes(period) ? prev.filter(p => p !== period) : [...prev, period]);
  };
  const handleToggleAirline = (code) => {
    setAirlinesFilter(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
  };

  // Derived state
  const filteredFlights = useMemo(() => {
    if (!dashboardData) return [];
    let flights = (viewingReturn && dashboardData.return_flights) ? dashboardData.return_flights : dashboardData.flights;

    if (stopsFilter.length > 0) {
      flights = flights.filter(f => {
        if (stopsFilter.includes('Non-stop') && f.stops === 'Non-stop') return true;
        if (stopsFilter.includes('1 Stop') && f.stops.includes('1 Stop')) return true;
        if (stopsFilter.includes('2+ Stops') && f.stops.includes('2+')) return true;
        return false;
      });
    }

    if (depPeriodFilter.length > 0) {
      flights = flights.filter(f => depPeriodFilter.includes(f.departure_period));
    }

    if (airlinesFilter.length > 0) {
      flights = flights.filter(f => airlinesFilter.includes(f.airline_code));
    }

    flights = flights.filter(f => f.lowest_price <= maxPrice);

    if (sortBy === 'Cheapest First') {
      flights.sort((a, b) => a.lowest_price - b.lowest_price);
    } else if (sortBy === 'Fastest First') {
      const getMins = (dur) => {
        const h = parseInt(dur.match(/(\d+)h/)?.[1] || 0);
        const m = parseInt(dur.match(/(\d+)m/)?.[1] || 0);
        return h * 60 + m;
      };
      flights.sort((a, b) => getMins(a.duration) - getMins(b.duration));
    } else if (sortBy === 'Earliest Departure') {
      flights.sort((a, b) => a.departure_time.localeCompare(b.departure_time));
    }

    return flights;
  }, [dashboardData, stopsFilter, depPeriodFilter, airlinesFilter, maxPrice, sortBy, viewingReturn]);

  const airlineCounts = useMemo(() => {
    if (!dashboardData) return {};
    const counts = {};
    ((viewingReturn && dashboardData.return_flights) ? dashboardData.return_flights : dashboardData.flights).forEach(f => {
      counts[f.airline_code] = (counts[f.airline_code] || 0) + 1;
    });
    return counts;
  }, [dashboardData, viewingReturn]);

  const airlineColors = {
    '6E': 'bg-blue-600',
    'AI': 'bg-red-600',
    'UK': 'bg-purple-700',
    'QP': 'bg-orange-500',
    'SG': 'bg-red-500',
    'IX': 'bg-teal-600'
  };


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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans relative overflow-x-hidden">
      
      {/* 1. Header & Status Badges */}
      <header className="border-b border-slate-200 bg-white/70 backdrop-blur-md absolute top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500 text-white p-2 rounded-xl">
              <Plane className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-2">
                AeroAggregator 
                <span className="bg-blue-400/20 text-blue-500 text-[10px] uppercase px-2 py-0.5 rounded-full border border-blue-400/30">
                  SIH Hackathon Innovation
                </span>
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              6 OTAs Active
            </div>
            <div onClick={() => setShowArchitecture(true)} className="bg-white/10 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-100 transition shadow-sm">
              Architecture
            </div>
            <div onClick={handleExportExcel} className={`text-xs font-bold px-3 py-1.5 rounded-full border cursor-pointer transition shadow-sm flex items-center gap-1 ${dashboardData ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'}`}>
              <Download className="w-3.5 h-3.5" /> Export Data (XLSX)
            </div>
          </div>
        </div>
        {/* Latency Ticker */}
        <div className="bg-blue-100/30 border-y border-blue-400/20 py-1.5 overflow-hidden flex whitespace-nowrap text-[11px] text-blue-600 font-mono">
          <div className="animate-[marquee_20s_linear_infinite] flex gap-8 px-4">
            <span>EaseMyTrip: 132ms</span>
            <span>MakeMyTrip: 125ms</span>
            <span>Cleartrip: 153ms</span>
            <span>Yatra: 140ms</span>
            <span>Ixigo: 180ms</span>
            <span>Goibibo: 279ms</span>
            <span>EaseMyTrip: 132ms</span>
            <span>MakeMyTrip: 125ms</span>
            <span>Cleartrip: 153ms</span>
            <span>Yatra: 140ms</span>
            <span>Ixigo: 180ms</span>
            <span>Goibibo: 279ms</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative w-full h-[600px]">
        {/* 3D Canvas Background */}
        <FlightCanvas />
        
        {/* Glassmorphic Search Dock Layer */}
        <div className="relative z-10 flex flex-col items-center justify-end h-full pb-12 px-4 pointer-events-none">
          <div className="bg-white/10 backdrop-blur-2xl border border-slate-200 shadow-2xl shadow-blue-900/5 rounded-3xl p-8 max-w-5xl w-full pointer-events-auto">
            
            <div className="flex gap-4 mb-6">
              <div className="bg-slate-100 rounded-lg p-1 flex">
                <button onClick={() => setTripType('One Way')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition ${tripType === 'One Way' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>One Way</button>
                <button onClick={() => setTripType('Round Trip')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition ${tripType === 'Round Trip' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>Round Trip</button>
              </div>
              <div className="bg-slate-100 rounded-lg p-1 flex border border-white/5">
                <select value={flightClass} onChange={(e) => { setFlightClass(e.target.value); fetchFlights(origin, destination, date, e.target.value); }} className="bg-transparent text-sm font-bold text-slate-400 px-3 py-1.5 outline-none appearance-none cursor-pointer">
                  <option className="bg-white">Economy</option>
                  <option className="bg-white">Premium Economy</option>
                  <option className="bg-white">Business</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex flex-col md:flex-row gap-4 relative">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                    className="w-full bg-white/70 text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 py-4 pl-12 pr-4 font-bold text-lg focus:outline-none focus:border-blue-500 transition uppercase"
                    placeholder="Origin (e.g. DEL)"
                  />
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-8 h-8 bg-white backdrop-blur-md border border-slate-200 rounded-full cursor-pointer hover:bg-black/60 transition">
                  <ArrowRight className="w-4 h-4 text-slate-900" />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    value={destination}
                    onChange={(e) => setDestination(e.target.value.toUpperCase())}
                    className="w-full bg-white/70 text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 py-4 pl-12 pr-4 font-bold text-lg focus:outline-none focus:border-blue-500 transition uppercase"
                    placeholder="Destination (e.g. BOM)"
                  />
                </div>
              </div>
              <div className={`flex gap-2 w-full ${tripType === 'Round Trip' ? 'md:w-96' : 'md:w-48'}`}>
                <div className="flex-1 relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white/70 text-slate-900 rounded-xl border border-slate-200 py-4 pl-12 pr-4 font-bold focus:outline-none focus:border-blue-500 transition text-sm"
                    style={{colorScheme: 'light'}}
                  />
                </div>
                {tripType === 'Round Trip' && (
                  <div className="flex-1 relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="date" 
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full bg-white/70 text-slate-900 rounded-xl border border-slate-200 py-4 pl-12 pr-4 font-bold focus:outline-none focus:border-blue-500 transition text-sm"
                      style={{colorScheme: 'light'}}
                    />
                  </div>
                )}
              </div>
              <button 
                onClick={() => fetchFlights()}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-400 shadow-lg shadow-blue-500/30 text-white font-bold py-4 px-8 rounded-xl transition flex items-center justify-center gap-2 md:w-auto w-full disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                {loading ? 'Aggregating...' : 'Find Cheapest Flights'}
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-900/70 font-semibold uppercase tracking-wider shadow-sm">Popular High-Traffic Routes:</span>
              {[
                {o: 'DEL', d: 'BOM'},
                {o: 'BLR', d: 'GOI'},
                {o: 'BOM', d: 'GOI'},
                {o: 'DEL', d: 'CCU'},
                {o: 'HYD', d: 'BLR'}
              ].map(r => (
                <button 
                  key={`${r.o}-${r.d}`}
                  onClick={() => handleRoutePillClick(r.o, r.d)}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full transition shadow-sm"
                >
                  {r.o} ➔ {r.d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-20">

        {/* 3. Smart Recommendation Ribbon */}
        {dashboardData && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-4 z-10">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <Zap className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${dashboardData.analytics.action.includes('BUY') ? 'bg-emerald-100 text-emerald-600 border border-emerald-300' : 'bg-orange-50 text-orange-500 border border-orange-200'}`}>
                    {dashboardData.analytics.action}
                  </span>
                  <span className="text-sm font-bold text-slate-400">{dashboardData.route} • {dashboardData.date}</span>
                </div>
                <p className="text-slate-400 text-sm font-medium">{dashboardData.analytics.reason}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 z-10 w-full lg:w-auto">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">LOWEST FARE</span>
                <span className="text-2xl font-black text-slate-900">₹{dashboardData.analytics.lowest_fare.toLocaleString()}</span>
              </div>
              <div className="w-px h-10 bg-slate-100 hidden sm:block"></div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">MAX OTA SPREAD</span>
                <span className="text-sm font-bold text-emerald-600 bg-emerald-400/10 px-2 py-1 rounded">Save up to ₹{dashboardData.analytics.max_spread}</span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                <button 
                  onClick={() => setShowChart(!showChart)}
                  className="flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200 text-slate-400 text-sm font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition flex items-center justify-center gap-2"
                >
                  <TrendingDown className="w-4 h-4" /> 14-Day Trend Chart
                </button>
                <button className="flex-1 sm:flex-none bg-blue-500/20 hover:bg-blue-500/30 text-blue-500 border border-blue-400/30 text-sm font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2">
                  <Bell className="w-4 h-4" /> Set Fare Watch
                </button>
              </div>
            </div>
            
            {showChart && dashboardData.analytics.trend_points && (
              <div className="w-full h-48 mt-6 border-t border-slate-200 pt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData.analytics.trend_points.map((p, i) => ({ day: `D-${14-i}`, price: p }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} dy={10} />
                    <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} dx={-10} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip 
                      contentStyle={{backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px'}}
                      itemStyle={{color: '#3b82f6'}}
                      formatter={(value) => [`₹${value}`, 'Price']}
                    />
                    <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{r: 6, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* 4. Two-Column Interactive Catalog Section */}
        {dashboardData && (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Column: Filters Sidebar */}
            <div className="w-full lg:w-72 shrink-0">
              <div className="bg-white border border-slate-200 rounded-3xl p-5 sticky top-24">
                <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</h3>
                  <button onClick={resetFilters} className="text-xs font-bold text-blue-500 hover:text-blue-400">Reset</button>
                </div>

                {/* Stops Filter */}
                <div className="mb-6 border-b border-slate-200 pb-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Stops</h4>
                  <div className="space-y-2">
                    {['Non-stop', '1 Stop', '2+ Stops'].map(stop => (
                      <div key={stop} onClick={() => handleToggleStops(stop)} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${stopsFilter.includes(stop) ? 'bg-blue-500 border-blue-500' : 'border-slate-200 group-hover:border-slate-500'}`}>
                          {stopsFilter.includes(stop) && <CheckCircle2 className="w-3.5 h-3.5 text-slate-900" />}
                        </div>
                        <span className="text-sm font-medium text-slate-400 group-hover:text-slate-900">{stop}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Departure Time */}
                <div className="mb-6 border-b border-slate-200 pb-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Departure Time</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'early', label: 'Early', time: '00-06' },
                      { id: 'morning', label: 'Morning', time: '06-12' },
                      { id: 'afternoon', label: 'Afternoon', time: '12-18' },
                      { id: 'night', label: 'Night', time: '18-24' },
                    ].map(period => (
                      <div 
                        key={period.id}
                        onClick={() => handleToggleDepPeriod(period.id)}
                        className={`p-2 rounded-xl border text-center cursor-pointer transition ${depPeriodFilter.includes(period.id) ? 'bg-blue-500/20 border-blue-400 text-blue-500' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-600 hover:text-slate-800'}`}
                      >
                        <div className="text-xs font-bold mb-0.5">{period.label}</div>
                        <div className="text-[10px] opacity-70">{period.time}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Airlines */}
                <div className="mb-6 border-b border-slate-200 pb-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Airlines</h4>
                  <div className="space-y-3">
                    {Object.keys(airlineCounts).sort().map(code => {
                      const name = dashboardData.flights.find(f => f.airline_code === code)?.airline;
                    
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

  return (
                        <div key={code} onClick={() => handleToggleAirline(code)} className="flex items-center justify-between cursor-pointer group">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${airlinesFilter.includes(code) ? 'bg-blue-500 border-blue-500' : 'border-slate-200 group-hover:border-slate-500'}`}>
                              {airlinesFilter.includes(code) && <CheckCircle2 className="w-3.5 h-3.5 text-slate-900" />}
                            </div>
                            <span className="text-sm font-medium text-slate-400 group-hover:text-slate-900">{name}</span>
                          </div>
                          <span className="text-xs text-slate-400 font-mono">{airlineCounts[code]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Max Price Slider */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Max Price</h4>
                    <span className="text-xs font-bold text-blue-500">₹{maxPrice.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min={dashboardData.analytics.lowest_fare} 
                    max={dashboardData.analytics.lowest_fare + 10000} 
                    step="500"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full accent-blue-400 bg-slate-100 rounded-lg appearance-none h-1.5 outline-none"
                  />
                </div>

                {/* Algorithm Notice */}
                <div className="bg-blue-50/40 border border-blue-100/50 p-4 rounded-xl mt-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-blue-400 mb-1">SIH Audit Engine</h5>
                      <p className="text-[10px] text-blue-300/70 leading-relaxed">Fares are continuously audited against hidden convenience fees across 6 Indian OTAs to ensure genuine lowest prices.</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: Multi-Flight Results List */}
            <div className="flex-1 flex flex-col gap-4">
              {dashboardData.return_flights && (
                <div className="flex items-center gap-6 mb-2 border-b border-slate-200 pb-2">
                  <button onClick={() => setViewingReturn(false)} className={`font-bold pb-2 border-b-2 transition ${!viewingReturn ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                    Departure ({origin} ➔ {destination})
                  </button>
                  <button onClick={() => setViewingReturn(true)} className={`font-bold pb-2 border-b-2 transition ${viewingReturn ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                    Return ({destination} ➔ {origin})
                  </button>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-2xl">
                <h2 className="text-sm font-bold text-slate-400">
                  <span className="text-slate-900">{filteredFlights.length} Flights Available</span> <span className="text-slate-400 mx-2">|</span> Live OTA Aggregator Active
                </h2>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                  <ArrowDownUp className="w-4 h-4 text-slate-400" />
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-sm font-bold text-slate-400 focus:outline-none appearance-none cursor-pointer outline-none"
                  >
                    <option className="bg-white">Cheapest First</option>
                    <option className="bg-white">Fastest First</option>
                    <option className="bg-white">Earliest Departure</option>
                  </select>
                </div>
              </div>

              {filteredFlights.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center">
                  <Search className="w-12 h-12 text-slate-400 mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No flights match your filters</h3>
                  <p className="text-slate-400 mb-6">Try adjusting your price range or stops criteria.</p>
                  <button onClick={resetFilters} className="bg-blue-500 text-white font-bold px-6 py-2 rounded-xl">Clear All Filters</button>
                </div>
              ) : (
                filteredFlights.map(flight => (
                  <div key={flight.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg transition hover:border-blue-300 group shadow-sm hover:shadow-md">
                    <div className="p-5 flex flex-col md:flex-row items-center gap-6">
                      
                      {/* Airline Info */}
                      <div className="flex items-center gap-4 w-full md:w-1/4">
                        <div>
                          <h4 className="font-bold text-slate-900">{flight.airline}</h4>
                          <p className="text-xs text-slate-400 font-mono">{flight.flight_number} • {flightClass}</p>
                        </div>
                      </div>

                      {/* Schedule */}
                      <div className="flex items-center justify-center gap-6 w-full md:w-2/4">
                        <div className="text-right">
                          <div className="text-xl font-black text-slate-900">{flight.departure_time}</div>
                          <div className="text-xs text-slate-400 font-bold">{viewingReturn ? destination : origin}</div>
                        </div>
                        <div className="flex flex-col items-center w-32 shrink-0">
                          <span className="text-xs font-bold text-slate-400 mb-1">{flight.duration}</span>
                          <div className="w-full flex items-center">
                            <div className="h-px bg-slate-200 flex-1"></div>
                            <Plane className={`w-4 h-4 text-slate-400 mx-2 ${viewingReturn ? 'rotate-180' : ''}`} />
                            <div className="h-px bg-slate-200 flex-1"></div>
                          </div>
                          <span className={`text-[10px] font-bold mt-1 ${flight.stops === 'Non-stop' ? 'text-emerald-600' : 'text-orange-500'}`}>
                            {flight.stops}
                          </span>
                        </div>
                        <div className="text-left">
                          <div className="text-xl font-black text-slate-900">{flight.arrival_time}</div>
                          <div className="text-xs text-slate-400 font-bold">{viewingReturn ? origin : destination}</div>
                        </div>
                      </div>

                      {/* Price & Action */}
                      <div className="w-full md:w-1/4 flex flex-col items-end border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                        <div className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-1 border border-emerald-200">
                          Best Deal v {flight.cheapest_ota}
                        </div>
                        <div className="text-2xl font-black text-slate-900 mb-0.5">₹{flight.lowest_price.toLocaleString()}</div>
                        <div className="text-xs font-bold text-blue-500 mb-3">Save ₹{flight.savings_vs_others} vs others</div>
                        
                        <button 
                          onClick={() => setExpandedFlightId(expandedFlightId === flight.id ? null : flight.id)}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-2 rounded-xl text-sm transition flex items-center justify-center gap-1.5"
                        >
                          Compare 6 OTAs <span className={`text-[10px] transition ${expandedFlightId === flight.id ? 'rotate-180' : ''}`}>▼</span>
                        </button>
                      </div>

                    </div>

                    {/* Expandable 6-OTA Drawer */}
                    {expandedFlightId === flight.id && (
                      <div className="bg-slate-50 border-t border-slate-200 p-5">
                        <h4 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-blue-500" /> Live Fare Breakdown Across All 6 OTAs
                          <span className="text-[10px] font-normal text-slate-400 ml-2 border-l border-slate-200 pl-2">(Normalized with hidden convenience fees & coupons)</span>
                        </h4>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                              <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <th className="py-3 px-4">OTA Provider</th>
                                <th className="py-3 px-4">Base Fare</th>
                                <th className="py-3 px-4">Convenience Fee</th>
                                <th className="py-3 px-4">Promo Coupon</th>
                                <th className="py-3 px-4 text-right">Net Final Price</th>
                                <th className="py-3 px-4 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {flight.ota_breakdown.map((ota, idx) => {
                                const isLowest = idx === 0;
                              
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

  return (
                                  <tr key={ota.provider_name} className={`border-b border-slate-200/50 transition hover:bg-white/50 ${isLowest ? 'bg-emerald-50' : ''}`}>
                                    <td className="py-3 px-4">
                                      <div className="font-bold text-slate-900 text-sm">{ota.provider_name}</div>
                                      <div className="text-[10px] text-slate-400 mt-0.5">{ota.badge}</div>
                                    </td>
                                    <td className="py-3 px-4 text-slate-400 font-mono text-sm">₹{ota.base_fare.toLocaleString()}</td>
                                    <td className="py-3 px-4 text-rose-400 font-mono text-sm">+₹{ota.convenience_fee.toLocaleString()}</td>
                                    <td className="py-3 px-4 text-emerald-600 font-mono text-sm">-₹{ota.promo_discount.toLocaleString()}</td>
                                    <td className="py-3 px-4 text-right font-black text-slate-900 text-base">₹{ota.net_price.toLocaleString()}</td>
                                    <td className="py-3 px-4 text-right">
                                      {isLowest ? (
                                        <button onClick={() => window.open(ota.booking_url, '_blank')} className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-lg shadow-emerald-900/50 whitespace-nowrap">
                                          Book Lowest Deal ↗
                                        </button>
                                      ) : (
                                        <button onClick={() => window.open(ota.booking_url, '_blank')} className="bg-slate-100 hover:bg-slate-200 text-slate-400 text-xs font-bold px-4 py-2 rounded-lg transition whitespace-nowrap">
                                          Book ↗
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* 6. Flash Fares Grid */}
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-6 bg-blue-400 rounded-full"></div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Limited Time Flash Fares: <span className="text-slate-400 font-bold">Cheapest Routes Across India Today</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {o: 'DEL', d: 'BOM', p: 3499, t: '15% OFF'},
              {o: 'BLR', d: 'GOI', p: 2199, t: 'TOP DEAL'},
              {o: 'DEL', d: 'JAI', p: 1499, t: 'STEAL'},
              {o: 'BOM', d: 'AMD', p: 1899, t: 'TRENDING'},
              {o: 'DEL', d: 'SXR', p: 4299, t: 'WEEKEND'},
              {o: 'HYD', d: 'BLR', p: 2599, t: 'HOT'}
            ].map(ff => (
              <div key={`${ff.o}-${ff.d}`} onClick={() => handleRoutePillClick(ff.o, ff.d)} className="bg-white border border-slate-200 hover:border-blue-400/50 p-5 rounded-2xl cursor-pointer transition group relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl z-10">
                  {ff.t}
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-black text-slate-900">{ff.o}</span>
                    <Plane className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition" />
                    <span className="text-xl font-black text-slate-900">{ff.d}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-400 font-bold mb-1">Starting from</div>
                <div className="text-2xl font-black text-emerald-600 group-hover:text-emerald-500 transition">₹{ff.p.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        <footer className="mt-20 pt-8 border-t border-slate-200 text-center pb-12">
          <Plane className="w-8 h-8 text-slate-700 mx-auto mb-4" />
          <div className="text-slate-400 font-bold text-sm tracking-widest uppercase">AeroAggregator • SIH Hackathon 2026</div>
          <div className="text-slate-400 text-xs mt-2 font-medium">Built for transparency. Real-time auditing.</div>
        </footer>

      </main>

      
      {/* Architecture Modal */}
      {showArchitecture && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowArchitecture(false)}></div>
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-3xl w-full shadow-2xl shadow-blue-900/20 relative z-10">
            <button onClick={() => setShowArchitecture(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 bg-slate-100 p-2 rounded-full transition">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-3">
              <Zap className="w-6 h-6 text-blue-500" /> System Architecture
            </h2>
            <p className="text-slate-500 font-medium mb-8">AeroAggregator SIH Engine - Real-time Distributed Flight Search</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 border border-blue-200">
                  <Navigation className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Frontend Engine</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Built with React & Vite. Utilizes Tailwind CSS for a highly responsive, light-theme interface. Features a full 3D interactive hero canvas powered by React Three Fiber & Drei.</p>
              </div>
              
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4 border border-emerald-200">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Aggregation API</h3>
                <p className="text-sm text-slate-500 leading-relaxed">FastAPI Python backend orchestrates concurrent requests across 6 major Indian OTAs. Evaluates base fares, injects hidden convenience fees, and deducts promo coupons.</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                <div className="w-10 h-10 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center mb-4 border border-orange-200">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Analytics & ML</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Analyzes 14-day historical pricing trends to generate actionable intelligence (BUY NOW vs WAIT) based on market volatility and route demand.</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 border border-purple-200">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Deceptive Pattern Engine</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Specifically flags "drip pricing" strategies where OTAs show artificially low base fares but heavily inflate final prices via mandatory fees at checkout.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Toast Notification */}
      <div className={`fixed bottom-6 right-6 bg-white border border-slate-200 text-slate-900 px-6 py-4 rounded-2xl shadow-2xl shadow-blue-900/10 transition-all duration-300 transform flex items-center gap-4 z-50 ${showToast ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'}`}>
        <div className="bg-emerald-100 p-2 rounded-full border border-emerald-300">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h4 className="font-bold text-sm">Aggregation Complete</h4>
          <p className="text-xs text-slate-400 font-medium">Aggregated {filteredFlights.length} flights across 6 OTAs!</p>
        </div>
        <button onClick={() => setShowToast(false)} className="ml-4 text-slate-400 hover:text-slate-900">
          <X className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
