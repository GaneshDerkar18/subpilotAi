# 🛡️ SubPilot AI

**Tagline:** Autonomous Agentic Commerce for Subscriptions — Auditing dark patterns and executing via PayPal behind deterministic guardrails.

An AI-agentic full-stack application that autonomously researches and manages financial subscriptions while enforcing strict enterprise safety guardrails. Built for the PayPal AI Hackathon.

---

## 🚀 Features

- **Live Web RAG Engine:** Utilizes LangChain, Groq LLM, and the Tavily Search API to scrape real-time merchant cancellation policies to prevent AI hallucinations and accurately calculate penalty fees.
- **Proactive Portfolio Optimization:** Evaluates active subscription lists during financial crunches, protecting critical assets (like health insurance) while targeting non-essentials.
- **Enterprise-Grade Guardrails:** A custom Python `GuardrailService` that blocks critical subscription cancellations, rejects out-of-context queries, and requires Human-in-the-Loop (HITL) authorization for destructive actions.
- **Dynamic 1-Click Multi-Target Execution:** Turns general AI financial advice into interactive cards with independent, 1-click execution buttons.
- **PayPal Sandbox Integration:** Fully integrated with the PayPal Subscriptions API via the Sandbox (`/v1/billing/subscriptions`) to execute verified cancellations and downgrades.
- **Modern FinTech UI:** A sleek, PayPal-inspired dashboard built with Next.js and Tailwind CSS, featuring a locked conversational copilot layout and independent loading states.

---

## 🏗️ Architecture & Tech Stack

- **Frontend:** Next.js (React), Tailwind CSS, TypeScript, Lucide Icons.
- **Backend:** Python, FastAPI (Async), LangChain, Pydantic.
- **Infrastructure:** Docker & Docker Compose.
- **AI & APIs:** Groq LPU Inference Engine, Tavily Search API, PayPal Sandbox API.

---

## 🛠️ How to Run Locally

### 1. Prerequisites
- Docker and Docker Compose installed on your machine.
- A Groq API Key and Tavily API Key.
- PayPal Sandbox Client ID and Secret.

### 2. Environment Setup
Create a `.env` file in your backend directory and add your keys:

```env
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
PAYPAL_MODE=sandbox
```

### 3. Running with Docker Compose
From the root of your project directory, run:
Bash
```
docker compose up --build
```
This will spin up both the FastAPI backend and the Next.js frontend concurrently.

### 4. Accessing the Application
 # Frontend Dashboard: http://localhost:3000

 # Backend API & Docs: http://localhost:8000/docs