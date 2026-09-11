export default function Sidebar() {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sticky top-24">
      <h3 className="font-semibold text-slate-900 mb-4">Filters</h3>
      
      <div className="mb-6">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Stops</h4>
        <div className="space-y-2">
          {['Non-stop', '1 Stop', '2+ Stops'].map((stop) => (
            <label key={stop} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-500" defaultChecked={stop === 'Non-stop'} />
              <span className="text-sm text-slate-700">{stop}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Price Range</h4>
        <input type="range" className="w-full accent-indigo-500" min="2000" max="15000" defaultValue="8000" />
        <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
          <span>₹2,000</span>
          <span>₹15,000</span>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Airlines</h4>
        <div className="space-y-2">
          {['IndiGo', 'Air India', 'Vistara', 'Akasa Air', 'SpiceJet'].map((airline) => (
            <label key={airline} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-500" defaultChecked />
              <span className="text-sm text-slate-700">{airline}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
