import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Plane, Zap, Star } from 'lucide-react';

export default function FlightCard({ flight, isCheapest, isFastest }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`bg-white rounded-2xl border ${isCheapest ? 'border-emerald-200 shadow-emerald-50' : 'border-slate-200'} shadow-sm overflow-hidden mb-4 transition-all hover:shadow-md`}>
      {/* Collapsed State */}
      <div 
        className="p-4 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4 w-1/3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-100">
            <Plane className="w-6 h-6" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{flight.airline}</div>
            <div className="text-xs text-slate-500 font-mono">{flight.flightNum}</div>
            <div className="flex gap-2 mt-1.5">
              {isCheapest && (
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  <Star className="w-3 h-3" /> Cheapest
                </span>
              )}
              {isFastest && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                  <Zap className="w-3 h-3" /> Fastest
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-1/3">
          <div className="flex items-center gap-3 text-slate-900 font-semibold">
            <span className="font-mono text-lg">{flight.departureTime}</span>
            <div className="h-[2px] w-12 bg-slate-200 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-300 border-2 border-white"></div>
            </div>
            <span className="font-mono text-lg">{flight.arrivalTime}</span>
          </div>
          <div className="text-xs font-medium text-slate-500 mt-1 bg-slate-100 px-2 py-0.5 rounded-full">{flight.duration}</div>
        </div>

        <div className="flex items-center justify-end gap-6 w-1/3">
          <div className="text-right">
            <div className="text-xs font-medium text-slate-500 mb-0.5">Lowest from</div>
            <div className="font-mono font-bold text-2xl text-slate-900 tabular-nums tracking-tight">
              ₹{flight.lowestPrice.toLocaleString('en-IN')}
            </div>
          </div>
          <div className={`p-2 rounded-full ${expanded ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 bg-slate-50 hover:bg-slate-100'} transition-colors`}>
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Expanded Table */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 bg-gradient-to-b from-slate-50/80 to-indigo-50/30"
          >
            <div className="p-5 overflow-x-auto">
              <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                Aggregated Offers <div className="h-px bg-indigo-100 flex-1"></div>
              </div>
              
              <div className="min-w-[600px] text-sm">
                <div className="grid grid-cols-6 gap-2 text-xs font-semibold text-slate-400 pb-3 mb-2 border-b border-indigo-100/50">
                  <div className="col-span-1">Provider</div>
                  <div className="text-right">Base Fare</div>
                  <div className="text-right">Conv. Fee</div>
                  <div className="text-right">Promo</div>
                  <div className="text-right text-indigo-900/60">Net Price</div>
                  <div className="text-right pr-2">Action</div>
                </div>

                {flight.otaPrices.map((offer, idx) => (
                  <div 
                    key={offer.ota} 
                    className={`grid grid-cols-6 gap-2 items-center py-3 border-b border-indigo-50/50 last:border-0 ${idx === 0 ? 'bg-emerald-50/60 rounded-xl -mx-3 px-3 border border-emerald-100/50 shadow-sm shadow-emerald-100/20' : 'px-3 -mx-3 hover:bg-white/60 rounded-xl transition-colors'}`}
                  >
                    <div className="font-semibold text-slate-700 flex flex-col items-start gap-1">
                      {offer.ota}
                      <span className="text-[9px] text-indigo-400/80 font-mono bg-indigo-50/80 border border-indigo-100/50 px-1.5 py-0.5 rounded leading-none">
                        {offer.latency}ms
                      </span>
                    </div>
                    <div className="text-right font-mono tabular-nums text-slate-500">₹{offer.basePrice.toLocaleString('en-IN')}</div>
                    <div className="text-right font-mono tabular-nums text-rose-400/80">+₹{offer.convenienceFee.toLocaleString('en-IN')}</div>
                    <div className="text-right font-mono tabular-nums text-emerald-500 font-medium">-₹{offer.promoDiscount.toLocaleString('en-IN')}</div>
                    <div className="text-right font-mono tabular-nums font-bold text-slate-800 text-base">₹{offer.netPrice.toLocaleString('en-IN')}</div>
                    <div className="text-right">
                      <button 
                        onClick={() => navigate('/checkout', { state: { selectedFlight: offer } })}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all w-full shadow-sm ${idx === 0 ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200' : 'bg-white border border-indigo-100 hover:bg-indigo-50 hover:border-indigo-200 text-indigo-600 shadow-indigo-100/20'}`}>
                        {idx === 0 ? 'Book Lowest' : 'Select'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
