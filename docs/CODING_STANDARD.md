# MediPlan Coding Standard (MCS)

## Verzeichnisstruktur

```text
js/
├── core/          Grundfunktionen und Datenzugriff
├── components/    wiederverwendbare UI-Bausteine
├── modules/       abgeschlossene Fachmodule
├── utils/         kleine zustandslose Hilfsfunktionen
└── app.js         Initialisierung
```

## Regeln

1. Ein Modul besitzt genau einen klaren fachlichen Zweck.
2. Datenzugriff läuft über `DataStore` und `Storage`.
3. UI-Rückmeldungen laufen über `UI`.
4. Wiederverwendbare Darstellung läuft über `Components`.
5. Kritische Medikamentendaten werden validiert und bestätigt.
6. Keine API-Schlüssel im Repository.
7. Keine personenbezogenen Testdaten im Quellcode.
8. Neue Funktionen benötigen einen Testfall und Changelog-Eintrag.

## Benennung

- Objekte/Module: `PascalCase`
- Funktionen/Variablen: `camelCase`
- CSS-Klassen des Designsystems: Präfix `mds-`
- Storage-Schlüssel: Präfix `mediplan_`

## Fehlerbehandlung

- Fehler verständlich anzeigen.
- Technische Details nicht ungefiltert dem Nutzer zeigen.
- Medizinische Angaben nie stillschweigend korrigieren.
