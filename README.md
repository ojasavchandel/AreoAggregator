# ✈️ SIHv2 — Smart Flight Price Aggregator

A real-time flight price comparison platform that aggregates live flight data from **MakeMyTrip** and **EaseMyTrip**, built for the **Smart India Hackathon (SIH)**.

---

## 🚀 Features

- 🔍 **Live Flight Search** — Search flights between Indian airports in real-time
- 💰 **Price Comparison** — Aggregates results from MakeMyTrip & EaseMyTrip side-by-side
- 🔄 **Round Trip Support** — Compare onward and return flights in one search
- 📊 **Price Trend Charts** — Visualize price history with interactive line graphs
- 🎛️ **Smart Filters** — Filter by stops, departure time, airlines, and max price
- 📥 **Export to Excel** — Download flight results as `.xlsx` files
- 🌐 **3D Flight Canvas** — Animated Three.js globe with flight path visualization
- ⚡ **Fast & Reactive UI** — Built with React 19, Vite, TailwindCSS, and Framer Motion

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| React 19 + Vite | UI Framework & Build Tool |
| TailwindCSS v4 | Styling |
| Framer Motion | Animations |
| Three.js + React Three Fiber | 3D Globe / Flight Canvas |
| Recharts | Price trend charts |
| React Router DOM | Client-side routing |
| XLSX | Excel export |
| Lucide React | Icons |

### Backend
| Tech | Purpose |
|------|---------|
| FastAPI | REST API server |
| Playwright + Playwright Stealth | Headless browser scraping |
| Pydantic | Data validation |
| Uvicorn | ASGI server |

---

## 📁 Project Structure

```
SIHv2/
├── api/                    # FastAPI backend
│   ├── index.py            # Main API routes (/api/flights)
│   ├── core/               # Core scraping logic
│   └── scrapers/           # Site-specific scrapers
├── backend/
│   └── adapters/
│       ├── makemytrip.py   # MakeMyTrip adapter
│       └── easemytrip.py   # EaseMyTrip adapter
├── src/                    # React frontend
│   ├── App.jsx             # Main application
│   └── components/
│       ├── FlightCanvas.jsx # 3D globe animation
│       ├── FlightCard.jsx   # Flight result card
│       ├── SearchDock.jsx   # Search form
│       └── Sidebar.jsx      # Filter sidebar
├── public/
├── vercel.json             # Vercel deployment config
├── vite.config.js
└── requirements.txt        # Python dependencies
```

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js** v18+
- **Python** 3.10+
- **pip**

---

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/SIHv2.git
cd SIHv2
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
pip install -r requirements.txt
playwright install chromium
```

### 4. Run the backend

```bash
uvicorn api.index:app --reload --port 8000
```

### 5. Run the frontend

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🌐 Deployment

This project is configured for **Vercel** deployment via `vercel.json`.

```bash
vercel --prod
```

> Make sure the FastAPI backend is deployed separately (e.g., on Railway, Render, or a VPS) and update the API base URL accordingly.

---

## 📸 Screenshots

<!-- Add screenshots here -->

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

[MIT](LICENSE)

---

<p align="center">Built with ❤️ for Smart India Hackathon</p>
