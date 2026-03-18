# MediReminder

An AI-powered hospital medication tracking web app built with React, TypeScript, and Tailwind CSS. Nurses track medication doses in real time, doctors get live visibility, and AI generates patient progress reports from nurse feedback notes.

---

## The Problem

In most hospitals today, nurses still track medication on **paper charts**. Doctors have no real-time visibility into whether a patient received their medicine. Missed doses go unnoticed. And there's no easy way to see patterns across weeks of care without reading through stacks of paper logs.

---

## The Solution

A simple dashboard where:
- **Nurses** mark each medication dose as given with one click
- **Nurses** add a short feedback note each time (patient response, side effects, mood)
- **Doctors** see real-time medication status for every patient across all wards
- **AI generates** a structured 15-day or 1-month patient progress report from all the accumulated nurse feedback notes

---

## Features

- Patient dashboard with ward-wise grouping
- Per-medication checklist with nurse name and timestamp
- Feedback notes per dose
- Full medication history per patient
- AI report generation (15-day / 30-day) — turns 50+ small nurse notes into a 2-minute doctor summary
- Clean, responsive UI built with Tailwind CSS

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), TypeScript |
| Styling | Tailwind CSS |
| Backend | Python, Flask (AI report API) |
| AI Reports | OpenAI GPT-3.5-turbo |

---

## How the AI Report Works

Every time a nurse marks a dose as given, they add a short note:
> *"Patient complained of mild nausea after dose"*
> *"Patient feeling much better, ate full meal"*
> *"Slight fever at 37.8°C, informed doctor"*

After 15 or 30 days, clicking **Generate Report** sends all these notes to GPT which produces a structured medical summary:

```
1. Summary          — overall adherence and patient status
2. Medication Compliance — which medicines were given consistently
3. Patient Response — patterns from nurse feedback notes
4. Observations     — concerns or notable trends
5. Recommendations  — suggestions for the doctor
```

---

## Project Structure

```
MediReminder/
├── src/                    # React + TypeScript source
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Setup

```bash
git clone https://github.com/Era-Of-Tharuna/MediReminder.git
cd MediReminder
npm install
npm run dev
```

Open http://localhost:5173

---

## Author

**Tharuna Rajpurohit**
- GitHub: [@Era-Of-Tharuna](https://github.com/Era-Of-Tharuna)
- LinkedIn: [tharuna-rajpurohit](https://linkedin.com/in/tharuna-rajpurohit)
