# KngArtusClient Shop – Render

Deutsche Website für **kostenlose** Downloads nach Einmal-Key oder persönlicher Admin-Freigabe. Kein Online-Payment; keine Minecraft-Mods gegen Geld verkaufen. Minecraft-EULA beachten.

## Veröffentlichung
- Render Node.js Web Service mit diesem GitHub-Repository verbinden.
- Branch **main**, Build **npm install**, Start **npm start**, Region **Frankfurt**, Plan für Test **Free**.
- Unter Render > Service > Environment einen langen geheimen Wert unter **ADMIN_PASSWORD** setzen (mindestens 16 Zeichen). Niemals den Wert auf GitHub veröffentlichen.
- Nach erfolgreichem Deployment die Render-URL aufrufen. Admin-Button öffnen, Passwort eingeben, über **JAR hochladen** die experimentelle Client-Datei direkt auf den Render-Server übertragen.
- Admin kann Einmal-Keys erzeugen und per WhatsApp verschicken. Freunde können zusätzlich eine Anfrage senden; Admin kann genehmigen oder ablehnen.

## WICHTIG
Dieses Repository ist **PUBLIC**. Die geschützte JAR, deine Passwörter und geheimen Keys dürfen dort nicht liegen. Die JAR ist deshalb nicht im Repository enthalten und muss privat im Admin-Bereich hochgeladen werden.

Render Free bietet **keinen persistenten Datenspeicher**. Bei einem Neustart oder Deploy können JAR, Einmal-Keys und Anfragen verloren gehen. Für einen zuverlässigen dauerhaften Shop braucht man persistenten Speicher und ggf. einen kostenpflichtigen Tarif; bitte vor Kosten die Zustimmung eines Erziehungsberechtigten einholen. Ein fester Link bedeutet nicht automatisch dauerhaft verfügbare Daten.

Der Client selbst ist eine **experimentelle, nicht im echten Minecraft 26.3 getestete** JAR. Zuerst in einem separaten Spielprofil testen. Kein offizielles Minecraft-Produkt. Vor öffentlichem Betrieb die rechtlichen Betreiberinformationen und die Datenschutzanforderungen prüfen.


## Zweites Produkt: 5er-Texture-Pack-Bundle (NEU, OHNE X-RAY)

- Im Shop erscheinen zwei Produkte: **KngArtusClient (.jar)** und **5er-Texture-Pack-Bundle (.zip)**.
- Das neue Bundle enthält: My Loading Screen, zombie-Ein_DonutYT, Dark Lime GUI, **My Voice Pack (1)** und **MyTexturePack (1)**.
- **X-Ray und My Cape sind nicht enthalten**. Die beiden zuletzt hochgeladenen Packs ersetzen die vorherigen Varianten.
- Aktuelle ZIP: `KngArtusClient-5er-Bundle-NEU-OHNE-XRAY-mc26.3.zip`.
- **WICHTIG:** Der Texture-Pack-Download ist erst wieder verfügbar, wenn du dich im Admin-Bereich anmeldest und die neue ZIP unter **JAR hochladen → 5er-Texture-Pack-Bundle (.zip)** hochlädst. Der neue Dateiname des privaten Speichers verhindert, dass Besucher die alte X-Ray-Version erhalten.
- Admin-Keys und persönliche Freigabeanfragen können weiterhin getrennt für Client und Texture Pack erstellt werden. Bestehende Texture-Pack-Keys bleiben mit dem Texture-Pack-Produkt verknüpft.
- Beide Produkte werden derzeit **kostenlos** freigeschaltet; es gibt keine Zahlungsfunktion. Weitergabe nur, soweit die Nutzungsrechte der einzelnen Packs dies erlauben.
- Render Free speichert Dateien und Keys nicht zuverlässig über Neustarts/Deploys hinweg. Für dauerhafte Nutzung ist persistenter Speicher nötig.
- JSON und ZIP wurden geprüft, aber das Bundle nicht in einer laufenden Minecraft-26.3-Installation getestet.
