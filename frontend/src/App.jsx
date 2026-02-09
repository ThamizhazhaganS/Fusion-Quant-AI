import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Search, Activity, TrendingUp, AlertCircle, Zap, Shield, BarChart3, Globe } from 'lucide-react';
import { getPrediction } from './api';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [ticker, setTicker] = useState('BTC-USD');
  const [volMultiplier, setVolMultiplier] = useState(1.0);
  const [scenarioEnabled, setScenarioEnabled] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const actualMultiplier = scenarioEnabled ? volMultiplier : 1.0;
      const result = await getPrediction(ticker, actualMultiplier);
      setData(result);
    } catch (err) {
      setError("Failed to fetch data. Please check the ticker.");
    } finally {
      setLoading(false);
    }
  };

  // Re-run simulation when multiplier or toggle changes
  useEffect(() => {
    if (data) {
      handlePredict();
    }
  }, [volMultiplier, scenarioEnabled]);

  return (
    <div className="min-h-screen bg-background text-text p-8 font-sans selection:bg-primary selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-xl">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  FusionQuant AI
                  {data && <span className="ml-3 text-muted/50 text-xl font-medium">| {ticker}</span>}
                </h1>
                <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-500/20 animate-pulse">
                  LIVE
                </span>
                {data && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${data.fusion_signal.includes('Buy') ? 'bg-green-500/20 border-green-500/50 text-green-400' :
                      data.fusion_signal.includes('Sell') ? 'bg-red-500/20 border-red-500/50 text-red-400' :
                        'bg-white/10 border-white/20 text-muted'
                    }`}>
                    {data.fusion_signal}
                  </span>
                )}
              </div>
              <p className="text-muted text-sm flex items-center gap-2">
                <Globe className="w-3 h-3 text-accent" /> Professional Multi-Source Intelligence
              </p>
            </div>
          </div>

          {data && (
            <div className="glass-panel px-6 py-3 flex items-center gap-4">
              <span className="text-muted text-xs uppercase font-bold">Market Sentiment</span>
              <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${data.sentiment}%` }}
                  className={`h-full ${data.sentiment > 50 ? 'bg-green-500' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}
                />
              </div>
              <span className={`font-bold text-sm ${data.sentiment > 50 ? 'text-green-500' : 'text-red-500'}`}>
                {data.sentiment > 50 ? 'Bullish' : 'Bearish'}
              </span>
            </div>
          )}
        </header>

        {/* Search & Scenario Builder */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="glass-panel p-6 lg:col-span-2">
            <form onSubmit={handlePredict} className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  placeholder="Enter Ticker (e.g., BTC-USD, AAPL)"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted/50"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-primary to-secondary px-8 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              >
                {loading ? <Activity className="w-5 h-5 animate-spin" /> : <>Analyze <TrendingUp className="w-5 h-5" /></>}
              </button>
            </form>
          </div>

          <div className={`glass-panel p-6 transition-all duration-300 ${!scenarioEnabled ? 'opacity-60' : 'opacity-100 ring-2 ring-secondary/30'}`}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-muted text-xs uppercase font-bold flex items-center gap-2">
                <Shield className="w-3 h-3 text-secondary" /> Scenario Mode
              </span>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold ${scenarioEnabled ? 'text-secondary' : 'text-muted'}`}>
                  {scenarioEnabled ? 'ON' : 'OFF'}
                </span>
                <button
                  onClick={() => setScenarioEnabled(!scenarioEnabled)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${scenarioEnabled ? 'bg-secondary' : 'bg-white/10'}`}
                >
                  <motion.div
                    animate={{ x: scenarioEnabled ? 20 : 2 }}
                    className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-lg"
                  />
                </button>
              </div>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              disabled={!scenarioEnabled}
              value={volMultiplier}
              onChange={(e) => setVolMultiplier(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-secondary disabled:cursor-not-allowed"
            />
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-muted">Cautious</span>
              <span className="text-secondary font-mono font-bold text-sm">{volMultiplier}x</span>
              <span className="text-[10px] text-muted">Aggressive</span>
            </div>
          </div>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        {data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-6"
          >
            {/* Stats Cards */}
            <StatCard label="Live Price" value={`$${data.last_close.toLocaleString()}`} icon={<Activity className="w-4 h-4 text-accent" />} />

            <div className={`glass-panel p-6 flex flex-col justify-center ${scenarioEnabled ? 'bg-primary/10 border-primary/50' : ''}`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-muted text-[10px] font-bold uppercase tracking-widest">Prediction Range</span>
              </div>
              <span className="text-2xl font-bold text-primary neon-text">
                ${data.predicted_next_day_lstm.toLocaleString()}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-muted font-mono">
                  Est: ${data.simulation_data[0].p10.toLocaleString()} - ${data.simulation_data[0].p90.toLocaleString()}
                </span>
              </div>
            </div>

            <StatCard label="Volatility Index" value={`${(data.volatility * 100).toFixed(2)}%`} />

            <div className="glass-panel p-6 flex flex-col justify-center relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />
                <span className="text-muted text-[10px] uppercase font-bold tracking-widest">Confidence Index</span>
              </div>
              <span className="text-3xl font-bold neon-text">{data.probability_increase_5_percent.toFixed(1)}%</span>
              <p className="text-[10px] text-muted mt-1">Probability of {'>'}5% gain in 30 days</p>
              <div className="absolute -right-4 -bottom-4 opacity-5 rotate-12">
                <TrendingUp className="w-24 h-24" />
              </div>
            </div>

            {/* Technical Indicators */}
            <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-panel p-4 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-muted text-[10px] font-bold uppercase">RSI (14d)</span>
                  <span className={`text-xl font-bold ${data.rsi > 70 ? 'text-red-500' : data.rsi < 30 ? 'text-green-500' : 'text-white'}`}>
                    {data.rsi.toFixed(2)}
                  </span>
                </div>
                <span className="text-[10px] bg-white/5 px-2 py-1 rounded-lg border border-white/10 uppercase">
                  {data.rsi > 70 ? 'Overbought' : data.rsi < 30 ? 'Oversold' : 'Neutral'}
                </span>
              </div>
              <div className="glass-panel p-4 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-muted text-[10px] font-bold uppercase">MACD Trend</span>
                  <span className={`text-xl font-bold ${data.macd > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {data.macd > 0 ? 'Bullish' : 'Bearish'}
                  </span>
                </div>
                <BarChart3 className="w-6 h-6 text-white/20" />
              </div>
              <div className="glass-panel p-4 flex items-center justify-between overflow-hidden relative">
                <div className="flex flex-col z-10">
                  <span className="text-muted text-[10px] font-bold uppercase">Model Strategy</span>
                  <span className="text-xl font-bold">Random Forest Fusion</span>
                </div>
                <Activity className="w-12 h-12 text-primary opacity-10 absolute -right-2" />
              </div>
            </div>

            {/* Historical Chart */}
            <div className="glass-panel p-6 lg:col-span-3 h-[450px]">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent" /> Historical Price Fusion
              </h3>
              <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={data.historical_data}>
                  <defs>
                    <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="Date" hide />
                  <YAxis domain={['auto', 'auto']} stroke="#52525b" tickFormatter={(val) => `$${val.toLocaleString()}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#ffffff20', borderRadius: '12px' }}
                    itemStyle={{ color: '#06b6d4' }}
                    formatter={(val) => [`$${val.toLocaleString()}`, "Price"]}
                  />
                  <Area type="monotone" dataKey="Close" stroke="#06b6d4" fillOpacity={1} fill="url(#colorHist)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Simulation Chart */}
            <div className="glass-panel p-6 h-[450px]">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-secondary" /> Probability Cloud
              </h3>
              <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={data.simulation_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="day" stroke="#52525b" />
                  <YAxis domain={['auto', 'auto']} stroke="#52525b" hide />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#ffffff20', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="p90" stackId="1" stroke="transparent" fill="#ec4899" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="p10" stackId="1" stroke="transparent" fill="transparent" />
                  <Line type="monotone" dataKey="mean" stroke="#ec4899" strokeWidth={3} dot={false} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}

const StatCard = ({ label, value, color = "text-white", highlight = false, icon = null }) => (
  <div className={`glass-panel p-6 flex flex-col justify-center ${highlight ? 'bg-primary/10 border-primary/50' : ''}`}>
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-muted text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </div>
    <span className={`text-2xl font-bold ${color} ${highlight ? 'neon-text' : ''}`}>{value}</span>
  </div>
);

export default App;

