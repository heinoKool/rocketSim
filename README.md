# Mission Control – Simulation

Eigenständiges Repository für die Website. Bereit für GitHub Pages.

## Inhalt
- `index.html` – Startseite
- `style.css` – Styles (NASA-inspiriert)
- `app.js` – Logik (Puzzle, Validierung, ASCII-Animation)
- `.nojekyll` – Schaltet Jekyll-Processing auf GitHub Pages aus

## Git – Initialisierung und erster Push
Erstelle auf GitHub ein leeres Repository (ohne README). Danach lokal:

```zsh
cd "/Users/vpham/bycsdrive/Seminar Informationstechnik Quereinstieg/S2027/Unterricht/Lernzirkel_AP10/Simulation"

# Git initialisieren
git init

# Dateien hinzufügen und committen
git add .
git commit -m "Initial commit: Simulation für GitHub Pages"

# Standardbranch setzen und Remote hinzufügen
# Ersetze <USER> und <REPO> mit deinem Account/Repo-Namen
git branch -M main
git remote add origin git@github.com:<USER>/<REPO>.git

# Push
git push -u origin main
```

## GitHub Pages aktivieren
- Öffne auf GitHub: Repository → Settings → Pages
- "Source": Deploy from a branch
- Branch: `main`, Folder: `/ (root)`
- Speichern. Nach ~1 Minute ist die Seite live unter
	`https://<USER>.github.io/<REPO>/`

Fertig! Änderungen einfach committen und pushen.
