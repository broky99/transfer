# KIS Bridge

KIS Bridge ist eine statische Webanwendung fuer den schnellen Transfer medizinischer Texte zwischen ChatGPT auf dem iPhone und einem Klinik-PC mit NEXUS. Der Klinik-PC kann die GitHub-Pages-Seite dauerhaft geoeffnet halten und neue Texte automatisch laden.

## Funktionen

- GitHub-Transfer ueber `data/payload.json`
- AES-GCM-Verschluesselung im Browser
- Zwischenablage lesen und schreiben
- Dateiaustausch ueber `data/file.json`
- Live-Aktualisierung mit Polling
- Lokale Historie im Browser
- Dark Mode, grosse Buttons, optimiert fuer Mobile und Desktop
- Vorbereitete Struktur fuer Queue, PDF und Bilder

## Installation

1. Repository klonen oder in GitHub oeffnen.
2. GitHub Pages fuer den Branch `main` aktivieren.
3. Als Quelle den Root-Ordner auswaehlen.
4. Die veroeffentlichte GitHub-Pages-URL auf iPhone und Klinik-PC oeffnen.

Die App benoetigt keinen Build-Schritt und kein Framework. Sie besteht nur aus HTML, CSS und Vanilla JavaScript.

## Einrichtung

In der App unter **Einstellungen** diese Werte eintragen:

- Owner: GitHub-Benutzer oder Organisation, zum Beispiel `broky99`
- Repo: Repository-Name, zum Beispiel `transfer`
- Branch: normalerweise `main`
- Pfad: `data/payload.json`
- GitHub Token: Fine-grained Token mit Schreibrechten
- Passwort: gemeinsames lokales Passwort fuer iPhone und Klinik-PC

Token und Passwort werden lokal im Browser gespeichert.

## GitHub Token

Ein Fine-grained Personal Access Token reicht aus.

1. GitHub oeffnen: Settings -> Developer settings -> Personal access tokens -> Fine-grained tokens.
2. Neues Token fuer das Repository erstellen.
3. Berechtigung **Contents: Read and write** vergeben.
4. Token kopieren und in KIS Bridge auf jedem verwendeten Geraet eintragen.

Bei einem privaten Repository braucht jedes Geraet einen Token zum Lesen und Schreiben. Bei einem oeffentlichen Repository ist fuer das Schreiben trotzdem ein Token erforderlich.

## Workflow

1. Text aus ChatGPT auf dem iPhone kopieren.
2. KIS Bridge auf dem iPhone oeffnen.
3. **Zwischenablage senden** antippen.
4. Der Klinik-PC laedt den neuen Text automatisch.
5. Mit **Kopieren** wird der Text auf dem Klinik-PC in die Zwischenablage gelegt.
6. Text in NEXUS einfuegen.

Die Live-Aktualisierung prueft bei aktivem Fenster alle 10 Sekunden. Im Hintergrund wird alle 60 Sekunden geprueft. Mit **Jetzt pruefen** kann jederzeit manuell geladen werden.

## Dateiaustausch

Unter **Datei** kann eine einzelne Datei verschluesselt nach GitHub uebertragen werden.

1. Auf dem sendenden Geraet Datei auswaehlen.
2. **Datei senden** antippen.
3. Auf dem empfangenden Geraet **Pruefen** antippen.
4. Wenn die Datei geladen ist, **Herunterladen** antippen.

Die Datei wird in `data/file.json` gespeichert und mit demselben Passwort wie der Texttransfer verschluesselt. Fuer den schnellen Austausch ist die Dateigroesse auf 3 MB begrenzt.

## iOS-Kurzbefehl

Optional kann ein Kurzbefehl `An KIS senden` angelegt werden:

1. In der Kurzbefehle-App einen neuen Kurzbefehl erstellen.
2. Im Teilen-Menue anzeigen und Text als Eingabe erlauben.
3. Eingabe URL-codieren.
4. URL oeffnen:

```text
https://DEINNAME.github.io/DEINREPO/#send=[URL-codierte Eingabe]
```

Beim Oeffnen uebernimmt KIS Bridge den Text und sendet ihn automatisch.

## Entwicklung

Die Projektstruktur ist bewusst schlicht:

```text
index.html
css/
  app.css
js/
  app.js
  github.js
  clipboard.js
  files.js
  sync.js
  ui.js
data/
archive/
README.md
```

Lokales Testen ist mit jedem statischen Webserver moeglich. Beispiel:

```powershell
python -m http.server 8000
```

Danach `http://localhost:8000` oeffnen.

Nicht implementiert, aber vorbereitet: Queue, PDF und Bilder. Diese Bereiche sollen spaeter als eigene kleine Module ergaenzt werden, ohne den bestehenden Texttransfer zu brechen.

## Datenschutz

Keine Patientennamen, Geburtsdaten, Fallnummern oder andere direkt identifizierende Daten uebertragen. GitHub speichert nur verschluesselten Inhalt, trotzdem bleiben organisatorische Datenschutzvorgaben massgeblich.
