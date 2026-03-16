---
name: frontend-fittnutri
description: Design system and frontend guidelines for FittNutri application. Use when creating or modifying any UI component, page, or dashboard in the FittNutri frontend.
---

# FittNutri Frontend Design System

## Tech Stack
- React 19 + Vite
- Material UI (MUI) v6 — primary component library
- Tailwind CSS v4 — utility classes
- Emotion — styled components
- Lucide React — icons
- React Hook Form — forms
- React Router DOM v7 — routing

## Brand Identity

### Colors
- Primary: verde — usado em botões, gráficos, bordas ativas
- Secondary: laranja — usado em valores de KPI, alertas, destaques
- Background: verde muito claro (quase branco) — fundo geral das páginas
- Text: cinza escuro — corpo de texto
- Never use colors outside this palette without justification

### Typography
- Follow MUI default typography scale
- KPI values: large, bold, colored (verde or laranja)
- Labels: small, gray, uppercase when used as category

### Identity Rules
- Always preserve the green/orange color scheme
- Never introduce blue, purple, or red as primary colors
- Red is only allowed for critical health alerts
- Keep the clean, medical/professional aesthetic

## Component Patterns

### KPI Cards
- Always show: value (large + colored), label, icon, trend or classification badge
- Classification badges: "Normal" (verde), "Alto" (laranja), "Crítico" (vermelho)
- Use MUI Card with subtle shadow
- Minimum info density: value + label + status

### Charts
- Library: Recharts (already used in PatientCharts.jsx)
- Always include: grid, tooltip, legend
- Use area fill with opacity for line charts
- Show percentage variation between data points
- Colors: verde for primary line, laranja for secondary

### Data Tables
- Zebra striping for readability
- Highlight out-of-range values with laranja/vermelho badge
- Use MUI Table components
- Sticky header for long tables

### Layout
- Prefer dense, information-rich layouts
- Use CSS Grid or MUI Grid for dashboard layouts
- Avoid large empty spaces
- Reference: Apple iCloud Database Monitoring dashboard density

## Dashboard Guidelines
- KPIs always at the top
- Charts in the middle section
- Tables at the bottom
- Sidebar or secondary info on the right column

## Rules
- Never change API calls, hooks, or prop interfaces
- Never change backend integration
- Only modify JSX and styling
- Always explain changes before implementing
- Preserve existing component structure when possible
- Prefer MUI components over raw HTML
- Use Lucide icons for consistency
```

Depois de salvar, o prompt do redesign fica assim no Claude Code:
```
@frontend-fittnutri use the planner skill to redesign the patient evolution dashboard.

Files to modify:
- frontend/src/Pages/Dashboard.jsx
- frontend/src/components/PatientCharts.jsx
- frontend/src/components/DataTable.jsx
- frontend/src/components/CalendarDemo.jsx

Reference design: Apple iCloud Database Monitoring dashboard (dense, professional, rich KPIs)

Problems to fix:
1. KPI cards sem hierarquia — adicionar trend, badge de classificação
2. Gráfico muito simples — area fill, tooltip rico, variação percentual
3. Tabela sem destaque — zebra striping, badges coloridos por valor
4. Layout vazio — grid mais denso, melhor uso do espaço

Analyze all files before proposing the plan.