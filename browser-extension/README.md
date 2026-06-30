# KIS Bridge Browser-Erweiterung

Diese Chrome/Edge-Erweiterung sendet markierten Text direkt an KIS Bridge.

## Nutzung

1. In ChatGPT oder auf einer anderen Webseite den fertigen Text markieren.
2. Rechtsklick.
3. **An KIS Bridge senden** auswählen.
4. KIS Bridge öffnet sich und sendet den Text automatisch an GitHub.
5. Am Klinik-PC erscheint der Text in KIS Bridge und kann nach NEXUS kopiert werden.

## Installation in Chrome/Edge

1. Repository herunterladen oder klonen.
2. Browser öffnen: `chrome://extensions` oder `edge://extensions`.
3. **Entwicklermodus** aktivieren.
4. **Entpackte Erweiterung laden**.
5. Den Ordner `browser-extension` auswählen.

## Voraussetzung

KIS Bridge muss im gleichen Browser bereits eingerichtet sein:

- Owner/Repo
- GitHub Token
- Verschlüsselungspasswort

Die Erweiterung übergibt nur den markierten Text an die KIS-Bridge-Seite. Die Verschlüsselung und GitHub-Speicherung erfolgen weiterhin lokal in KIS Bridge.
