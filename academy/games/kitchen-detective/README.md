# KC FUTURA – Küchen-Detektiv

Modulares Beobachtungs-, Logik- und Fehlersuchspiel für die KC-FUTURA-Spielewelt.

## Status

- 20 Fälle angelegt
- 6 Spielmodi: Dieb, falscher Ort, fehlt/verlegt, Lügner, Logik, Kombifall
- 4 Schwierigkeitsstufen
- transparentes Punktesystem mit Aufschlüsselung nach jedem Fall
- Hinweise mit definierten Punktabzügen
- Serienbonus und Zeitbonus
- mobile und Desktop-Darstellung
- Hinweis-Markierung nach der Auflösung
- Szenen sind datengetrieben und beliebig erweiterbar

## Bildstil

Alle Szenen sollen nahezu fotorealistisch wirken: professionelle Restaurant- oder Großküche, natürliche Erwachsene, realistische Arbeitskleidung und Geräte, glaubwürdiges Licht, keine Comic-/Kinderoptik. Der entscheidende Hinweis muss klein, aber bei genauer Beobachtung fair erkennbar sein. Bildformat vorzugsweise 16:9, mindestens 1600×900.

Die Bilddateien werden unter `assets/kd-001.webp` bis `assets/kd-020.webp` erwartet. Bis diese final erzeugt und freigegeben sind, bleibt die Spiellogik unabhängig von den Bildassets testbar.

## Erweiterung

Neue Fälle werden ausschließlich als neue Objekte in `scenes.js` ergänzt. Jeder Fall besitzt ID, Titel, Modus, Schwierigkeitsgrad, Grundpunkte, Frage, Antworten, Lösung, zwei Hinweise, Bildpfad und eine normalisierte Hinweis-Markierung. Damit können später weitere 20er-/50er-Pakete, Weihnachtsmarkt-Fälle, Service, Fleischerei/Grill oder Prüfungsfälle ergänzt werden, ohne die Engine umzubauen.

## Punktesystem

Grundwerte: Leicht 100, Mittel 150, Schwer 220, Meisterfall 300. Dazu kommen +40 für den ersten bzw. +15 für den zweiten richtigen Versuch, bis +30 Zeitbonus und +50 nach fünf richtigen Fällen in Serie. Pro Fehlversuch werden 20 Punkte abgezogen. Hinweis 1 kostet 25 Punkte, Hinweis 2 zusätzlich 40 Punkte. Die komplette Rechnung wird nach jedem gelösten Fall angezeigt.

## Migration in KC FUTURA

Das Modul ist absichtlich gekapselt. Für die erste Integration kann die Spielewelt den Einstieg `academy/games/kitchen-detective/index.html` öffnen oder einbetten. Danach sollte ein gemeinsamer `KCFuturaGameBridge` ergänzt werden, über den FUTURA Benutzer-ID, Gesamtpunkte, Erfolge, Level und Statistik übernimmt. Das bestehende Academy-Core muss für den ersten Test nicht verändert werden.

## Nächste Integrationsschritte

1. 20 finale fotorealistische Szenenbilder erstellen und nach `assets/` legen.
2. Spielkachel in der bestehenden FUTURA-Spielewelt ergänzen.
3. `KCFuturaGameBridge` an das vorhandene Punkte-/Profil-System anbinden.
4. Testlauf auf Handy, Tablet und Desktop.
5. Danach weitere Szenenpakete ergänzen.
