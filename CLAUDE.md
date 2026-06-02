# Mycelium Lab — contesto per Claude Code

Sito brochure di **Mycelium Lab s.r.l.** (P.IVA 04262350368, Modena) — robot agricolo elettrico autonomo. Italiano, single-page, magenta `#ec1aa3` su dark `#0a0a0d`.

## Live & deploy
- **Produzione**: https://myceliumlab.it (Hostinger LiteSpeed, IP `195.35.49.153`)
- **Mirror**: https://maggiomusic.github.io/Myceliumlab.it/ (GitHub Pages, backup)
- **Auto-deploy**: ogni `git push origin main` → Hostinger fa `git pull` in `public_html/` via webhook (~25s). Non serve toccare hPanel.

## Struttura
- `index.html` — 5 sezioni in ordine: `#home`, `#filosofia`, `#caratteristiche`, `#applicazioni`, `#contatti`
- `style.css` — design system, CSS vars, `clamp()` ovunque, media query a 768px e 720px
- `script.js` — sidenav, scrollspy, popup Caratteristiche, gallery Applicazioni autoscroll, canvas filaments
- `img/` — `home.jpeg` (hero), `node.png` (showroom), `concept.png`, `STAFF.png`, `logo2.png`, `Applicazioni/` (16 PNG)
- SEO/AEO: `robots.txt`, `sitemap.xml`, `manifest.webmanifest` + JSON-LD in `<head>` (Organization+LocalBusiness+Product+FAQ)

## Pattern copy popup/card (richiesto dall'utente)
Quando l'utente fornisce testi con `*...*`:
- **prima riga isolata in asterischi** → `<p><em>subtitle</em></p>` (claim/manifesto italic)
- **`*keyword*` dentro frasi** → `<strong>keyword</strong>` (bold sulla keyword)
- usa entities italiane (`&egrave;`, `&agrave;`, `&ograve;`, `&ugrave;`)
- niente classi custom: lo styling popup `.node__popup-content p` è già pronto

## Caratteristiche — 10 voci in ordine alfabetico (5 sopra + 5 sotto)
**Top**: Acquisto / Noleggio · Attrezzi · Autonomia · Connesso · Controllo
**Bottom**: Dimensioni · Funzioni · Garanzia · Propulsione · Vantaggi
Tutti i popup vivono in `<template id="nodeSpecs">` con `data-spec="..."`.

## Workflow
1. Modifica → `git add` + `git commit` + `git push origin main`
2. Aspetta ~25s, verifica con `curl -s https://myceliumlab.it/ | grep "stringa nuova"`
3. Niente PR, niente staging — il main è production.

## Note
- Il File Manager Hostinger v2.63 mostra solo `.spazzatura` e `NON_CARICARE_QUI` al livello root (NON è la docroot). Per gestire i file usa Git, non quello.
- Sezione Filosofia: la grid 2×2 ha card di lunghezza disuguale (Ecosistemi vivi e Architettura sono lunghe, Missione e Visione corte). L'utente lo sa e va bene così.
- Home hero: padding-top `clamp(10px, 2.5vh, 32px)`, overlay con doppia fascia scura (top cielo + bottom orizzonte) che lascia luminoso il vigneto centrale.
