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


## Zweites Produkt: Texture Pack mit X-Ray
- Im Shop erscheinen zwei Produkte: **KngArtusClient (JAR)** und **6-in-1 Texture Pack + X-Ray (ZIP)**.
- Das Pack enthält Loading Screen, Zombie, Dark Lime GUI, Voice, MyTexturePack und X-Ray; **My Cape ist nicht enthalten**.
- Im Admin-Bereich unter **JAR hochladen** das Produkt **Texture Pack** wählen und die Datei `KngArtusClient-6-in-1-TexturePack-MIT-XRAY-mc26.3.zip` hochladen.
- Für beide Produkte getrennte einmalige Schlüssel erzeugen; auch Freigabeanfragen gelten jeweils nur für das gewählte Produkt.
- Beide Produkte werden **kostenlos** per Key oder Admin-Freigabe geteilt. Zahlungsfunktionen sind nicht enthalten. Rechte an allen verwendeten Packs vor Weitergabe prüfen.
- X-Ray nur auf Servern einsetzen, die es ausdrücklich erlauben. X-Ray-Effekt ist technisch nicht im echten Minecraft 26.3 getestet.
- Nach **jedem kostenlosen Render-Neudeploy** hochgeladene ZIP/JAR, Keys und Anfragen prüfen. Ohne persistente Datenbank und Dateispeicher können sie verschwinden.
