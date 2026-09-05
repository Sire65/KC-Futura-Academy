# KC Spielpause 2.3.0 – Studio-/TÜV-Kandidat

Gemeinsame Spielelounge für Memory, Küchenlicht, Tic-Tac-Toe, Einarmigen Banditen, Würfelbecher, Vier gewinnt, KC Gläserturm und KC Küchenbrigade. Das Verzeichnis ist ein Fachmodul und registriert ausdrücklich keinen neuen Master-Core.

## Architektur

- gemeinsame Game-Shell, Bedienung, Edition-, Asset- und Game-Registry;
- Wiederverwendung von `tic-tac-toe-core.mjs`;
- vorhandene KC-Avatare werden referenziert, nicht kopiert;
- Lernstand wird ausschließlich lesend aus dem bestehenden lokalen Trainingsprofil bezogen;
- keine neue Datenbanktabelle und keine direkte Datenbankmutation;
- bestehende Einzelspiele bleiben für einen vollständigen Rückbau unverändert erhalten.

## Freigabestatus

`candidate-yellow`: Die statischen und logischen Tests müssen bestanden sein. Visuelle Abnahme bei 1024×768 und reale Touchprüfung bleiben vor der Produktionsfreigabe verpflichtend.
