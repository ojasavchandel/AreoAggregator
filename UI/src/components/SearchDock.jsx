import { useState } from 'react';
import { Search } from 'lucide-react';

export default function SearchDock({ onSearch, isLoading }) {
  const [origin, setOrigin] = useState('DEL');
  const [dest, setDest] = useState('BOM');
  const [date, setDate] = useState('2026-10-15');
  const [cabin, setCabin] = useState('Economy');

  const handleSearch = () => {
    onSearch({ origin, dest, date, cabin });
  };

  return (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap md:flex-nowrap gap-4 items-end w-full">
      <div className="flex-1 min-w-[120px]">
        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Origin</label>
        <input 
          type="text" 
          value={origin} 
          onChange={(e) => setOrigin(e.target.value)} 
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
        />
      </div>
      
      <div className="flex-1 min-w-[120px]">
        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Destination</label>
        <input 
          type="text" 
          value={dest} 
          onChange={(e) => setDest(e.target.value)} 
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
        />
      </div>
      
      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Date</label>
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
        />
      </div>
      
      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Cabin</label>
        <select 
          value={cabin} 
          onChange={(e) => setCabin(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
        >
          <option>Economy</option>
          <option>Premium Economy</option>
          <option>Business</option>
          <option>First Class</option>
        </select>
      </div>
      
      <button 
        onClick={handleSearch}
        disabled={isLoading}
        className={`shadow-md shadow-indigo-200 text-white font-bold px-8 py-2 rounded-xl flex items-center justify-center gap-2 h-[42px] transition-all whitespace-nowrap w-full md:w-auto ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
      >
        <Search className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Searching...' : 'Search Flights'}
      </button>
    </div>
  );
}
