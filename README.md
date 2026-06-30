# KIS Bridge

Statische GitHub-Pages-App für iPhone → Klinik-PC.

## Dateien
- `index.html` in dein GitHub-Pages-Repository hochladen/ersetzen.
- Die App speichert verschlüsselt nach `data/payload.json`.

## Einrichtung
1. GitHub Fine-grained Token erstellen: Repository → Contents: Read and write.
2. Seite öffnen.
3. Owner, Repo, Branch `main`, Datei `data/payload.json`, Token und Passwort eintragen.
4. Auf iPhone und Klinik-PC dieselben Werte eintragen.

## iOS-Kurzbefehl "An KIS senden"
Kurzbefehle-App:
1. Neuer Kurzbefehl: `An KIS senden`
2. Details: Im Teilen-Menü anzeigen, Eingabe: Text.
3. Aktion: `URL codieren` mit Kurzbefehleingabe.
4. Aktion: `URL öffnen`:
   `https://DEINNAME.github.io/DEINREPO/#send=[URL-codierte Eingabe]`
5. Beim Öffnen sendet KIS Bridge automatisch den Text.

## Datenschutz
Keine Patientennamen/Geburtsdaten/Fallnummern übertragen. GitHub speichert nur Ciphertext; Passwort ist erforderlich zum Lesen.
