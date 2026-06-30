# KIS Bridge Setup-Start
# Diese Datei lokal auf dem Dienstrechner speichern und die Platzhalter ausfuellen.
# Danach per Rechtsklick -> Mit PowerShell ausfuehren oder ueber eine Desktop-Verknuepfung starten.

$settings = [ordered]@{
    owner = "broky99"
    repo = "transfer"
    branch = "main"
    path = "data/payload.json"
    token = "HIER_GITHUB_TOKEN_EINFUEGEN"
    password = "HIER_PASSWORT_EINFUEGEN"
}

$json = $settings | ConvertTo-Json -Compress
$bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
$setup = [Convert]::ToBase64String($bytes).TrimEnd("=").Replace("+", "-").Replace("/", "_")
$url = "https://broky99.github.io/transfer/#setup=$setup"

Start-Process $url
