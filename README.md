AeroAggregator ✈️ | SIH Hackathon Innovation

Real-Time Airfare Intelligence & Deceptive Pattern Auditing Platform

AeroAggregator is a full-stack flight aggregation platform engineered for the Smart India Hackathon. It automates airfare data collection across major Indian carriers and Online Travel Agencies (OTAs) to support institutional retail inflation tracking (MoSPI / CPI frameworks) while providing consumers with transparent, fee-audited pricing intelligence.

🛠️ System Architecture

🖥️ Frontend Presentation Layer
Framework: React & Vite for ultra-fast performance and hot-reloading.
Styling & UI: Tailwind CSS, Lucide Icons, and Recharts for interactive analytics.
3D Visual Engine: Three.js powered by React Three Fiber & Drei for the interactive aerospace hero canvas.


⚡ Backend API Layer
Framework: FastAPI (Python) for lightning-fast asynchronous routing and JSON serialization.
Server: Uvicorn handling high-concurrency requests and background task orchestration.


🕷️ Data Extraction & Scraping Engine
Core Automation: Asynchronous Playwright instances navigating complex JavaScript-heavy DOMs.
Resilience: Built to handle dynamic page elements and secure clean data extractions reliably.


📊 Intelligence & Auditing Core
Fee Decomposition: Automatically strips out base fares, UDF taxes, convenience fees, and active promo coupons.
Deceptive Pattern Flagging: Computes true net totals to instantly expose OTA "drip pricing" markups.



🚀 Key Features
WAF-Resilient Scraping: Bypasses bot-protection layers to extract clean pricing quotes.
Interactive 3D Aerospace Hero: Features a custom .glb aircraft model with smooth orbit controls and high-end lighting.
Multi-OTA Price Normalization: Expands flight entries into a detailed fee-breakdown table comparing base fares, convenience fees, and promo discounts.
Granular Filtering: Real-time filtering by stops, departure time blocks, airline carriers, and maximum price limits.

📦 Tech Stack
Frontend: React, Vite, Tailwind CSS, Three.js, @react-three/fiber, @react-three/drei
Backend: Python, FastAPI, Uvicorn, Playwright (Async)

### Quick Start

**Prerequisites:** Python 3.10+ and Node.js (v18+)

#### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/aero-aggregator.git](https://github.com/your-username/aero-aggregator.git)
cd aero-aggregator
```

2. Run the Backend

```Bash

cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium
uvicorn main:app --reload --port 8000
```

3. Run the Frontend
Open a separate terminal window:
```Bash
cd UI
npm install
npm run dev
```

Navigate to http://localhost:5173 in your browser.

Problem Statement Alignment (MoSPI / CPI)
Developed to address national data collection requirements for retail inflation indexing, bridging the gap between fragmented travel ecosystems and institutional economic monitoring across high-traffic Indian city-pairs.


