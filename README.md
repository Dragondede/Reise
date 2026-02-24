# 🌍 ReiseRadar — KI-gestützte Reisesuche

Dein persönlicher Reise-Schnäppchenjäger als Web-App für Browser & iPhone!

---

## 🚀 In 5 Minuten online stellen (kostenlos!)

### Was du brauchst:
1. Einen **Anthropic API-Key** (kostenlos erstellen auf https://console.anthropic.com)
2. Einen **Vercel Account** (kostenlos auf https://vercel.com — mit GitHub anmelden)

---

### Schritt 1: GitHub Repository erstellen

1. Gehe auf https://github.com/new
2. Name: `reiseradar`
3. Klicke **"Create repository"**
4. Lade alle Dateien aus diesem Ordner hoch:
   - Klicke **"uploading an existing file"**
   - Ziehe ALLE Dateien/Ordner rein (`index.html`, `api/`, `vercel.json`, `manifest.json`, `icons/`)
   - Klicke **"Commit changes"**

### Schritt 2: Auf Vercel deployen

1. Gehe auf https://vercel.com/new
2. Wähle dein `reiseradar` Repository
3. Klicke **"Deploy"** — fertig!
4. Du bekommst eine URL wie: `reiseradar-xxx.vercel.app`

### Schritt 3: API-Key hinzufügen

1. In Vercel: Gehe zu deinem Projekt → **Settings** → **Environment Variables**
2. Füge hinzu:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** Dein API-Key (beginnt mit `sk-ant-...`)
3. Klicke **"Save"**
4. Gehe zu **Deployments** → Klicke **"Redeploy"**

### ✅ Fertig! 

Deine App ist jetzt unter `https://reiseradar-xxx.vercel.app` erreichbar!

---

## 📱 Auf iPhone Home-Bildschirm

1. Öffne deine URL in **Safari**
2. Tippe auf **📤 Teilen** (unten in Safari)
3. Tippe auf **"Zum Home-Bildschirm"**
4. Tippe **"Hinzufügen"**

→ ReiseRadar erscheint als App-Icon auf deinem Home-Bildschirm!

---

## 📱 Auf Android Home-Bildschirm

1. Öffne deine URL in **Chrome**
2. Tippe auf **⋮** (3 Punkte oben rechts)
3. Tippe **"App installieren"** oder **"Zum Startbildschirm hinzufügen"**

---

## 💰 Kosten

- **Vercel Hosting:** Kostenlos (Hobby Plan)
- **Anthropic API:** Pay-per-use (ca. 0,01-0,05€ pro Suche)
  - Du kannst ein Limit setzen auf https://console.anthropic.com

---

## 📁 Projektstruktur

```
reiseradar/
├── index.html          ← Die App (Frontend)
├── api/
│   └── search.js       ← API-Proxy (Backend)
├── vercel.json         ← Vercel Konfiguration
├── manifest.json       ← PWA Konfiguration
├── icons/
│   ├── icon-192.png    ← App-Icon (klein)
│   └── icon-512.png    ← App-Icon (groß)
└── README.md           ← Diese Datei
```

---

## 🔧 Eigenes Icon verwenden

Ersetze die Dateien in `icons/` mit deinem eigenen Logo:
- `icon-192.png` — 192x192 Pixel
- `icon-512.png` — 512x512 Pixel

---

## ❓ Probleme?

| Problem | Lösung |
|---------|--------|
| "API Key nicht konfiguriert" | Environment Variable in Vercel prüfen → Redeploy |
| App lädt nicht | URL prüfen, Vercel Dashboard checken |
| Suche gibt Fehler | API-Key Guthaben prüfen auf console.anthropic.com |
