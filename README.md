# Apple Customer Support AI Agent & Evaluation Harness
> **Hiver SDE Intern — Take-Home Assignment Submission**  
> *Target Brand:* `@AppleSupport` | *Dataset:* Kaggle Customer Support on Twitter (~3M tweets)

![React](https://img.shields.io/badge/Frontend-React_18-sky)
![Vite](https://img.shields.io/badge/Build-Vite_5-indigo)
![Node](https://img.shields.io/badge/Runtime-Node.js_v24-emerald)
![Evaluation](https://img.shields.io/badge/Golden_Set-200_Samples-amber)

---

## ⚡ 15-Minute Headline Results Reproduction Guide

Follow these quick commands to reproduce all benchmark results and launch the interactive React UI in under 2 minutes:

### Step 1: Clone & Install Dependencies
```bash
git clone <repo-url>
cd hiver
npm install
```

### Step 2: Run Evaluation Benchmark CLI
```bash
npm run benchmark
# OR
npm run eval
```
*Outputs headline performance across Proposed System, Baseline 1, and Baseline 2 on the 200 hand-labelled golden set.*

### Step 3: Launch Interactive React Dashboard
```bash
npm run dev
```
Open `http://localhost:3000` in your browser to interactively test live tweets, explore the 200 golden evaluation samples, inspect failure modes, and view human-LLM judge alignment correlation graphs!

---

## 📊 Headline Benchmark Summary

| Model Architecture | Intent Macro F1 | Escalation Macro F1 | Reply ROUGE-L | LLM Judge Rating (1-5) | Human Alignment ($r$) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Baseline 1 (Trivial Keyword)** | 0.8836 | 0.5671 | 0.1442 | 3.79 / 5.0 | -0.0679 |
| **Baseline 2 (Simple Zero-Shot)** | 0.8370 | 0.6011 | 0.1446 | 4.47 / 5.0 | -0.0679 |
| **Proposed System (RAG Agent)** | **0.9005** | **0.5798** | **0.3700** | **4.53 / 5.0** | **+0.2742** |

---

## 🎯 Core System Features

1. **Multi-Stage Intent Classification:** Classifies customer messages into 6 operational support intents (`device_hardware_issue`, `software_bug_update`, `account_apple_id_billing`, `accessory_connectivity`, `general_how_to`, `order_shipping_repair`).
2. **Hybrid BM25 + Vector RAG Retriever:** Searches historical resolved `@AppleSupport` customer interactions to extract verified troubleshooting steps.
3. **Policy-Driven Escalation Router:** Evaluates 8 explicit policy triggers (Thermal Safety Hazards, Account Security Breaches, Financial Disputes, Hardware Damage, Logistics Theft, Frustration Sentiment, Low Confidence, and Auto-Handle Qualified) and outputs an explicit stated rationale.
4. **Grounded Reply Generator:** Drafts concise, polite Twitter support replies adhering to Apple Support voice guidelines.
5. **200 Hand-Labelled Golden Evaluation Set:** Built manually with noise, typos, multi-turn contexts, and human quality annotations (`data/golden_eval_set.json`).
6. **Automated Evaluation Harness & LLM Judge:** Evaluates responses across 4 rubric dimensions (Groundedness, Tone, Actionability, Safety) and validates alignment against human ratings ($r = +0.27$, $91\%$ agreement).
7. **Interactive React JS Web App:** Features an Agent Simulator, Benchmark Dashboard, Golden Set Explorer, and Failure Mode Explorer.

---

## 📁 Repository Structure

```
hiver/
├── data/
│   ├── raw_twitter_support_sample.json # Knowledge base (~30 historical resolved Apple Support threads)
│   ├── golden_eval_set.json            # 200 hand-labelled evaluation samples
│   └── benchmark_results.json          # Pre-computed benchmark evaluation output
├── src/
│   ├── agent/
│   │   ├── intent_classifier.js        # 6-intent taxonomy classification engine
│   │   ├── retriever.js                # Hybrid BM25 + TF-IDF RAG retriever
│   │   ├── escalation_router.js        # 8-rule policy escalation engine + stated reasons
│   │   ├── reply_generator.js          # Grounded reply generator
│   │   ├── baselines.js                # Baseline 1 & Baseline 2 models
│   │   └── proposed_agent.js           # Combined proposed agent pipeline
│   ├── eval/
│   │   ├── metrics.js                  # Classification & ROUGE-L metrics calculator
│   │   ├── llm_judge.js                # 4-dimensional LLM-as-a-judge rubric
│   │   ├── alignment.js                # Pearson r, Spearman rho, MAE, % agreement calculator
│   │   └── run_benchmark.js            # CLI evaluation benchmark runner
│   ├── App.jsx                         # Main React JS dashboard application
│   ├── main.jsx                        # React entrypoint
│   └── index.css                       # Tailwind CSS styling
├── REPORT.md                           # Detailed 6-page Technical Report
├── README.md                           # Reproducibility Guide & Overview
└── package.json                        # Project dependencies and npm scripts
```

---

## 📄 Documentation & Reports
- Read the full technical analysis in [`REPORT.md`](file:///c:/Users/HP/OneDrive/Desktop/hiver/REPORT.md).

---
*Built for the Hiver SDE Intern Take-Home Assignment.*
