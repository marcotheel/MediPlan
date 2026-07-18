# MediPlan Design System (MDS)

## Zweck

Das MediPlan Design System stellt sicher, dass alle Seiten und künftigen Module gleich aussehen, gleich reagieren und gut bedienbar bleiben.

## MDS-01 – Farben

| Token | Wert | Verwendung |
|---|---:|---|
| Primary | `#00A99D` | Hauptaktionen, aktiver Zustand |
| Secondary | `#34C759` | Erfolg, Fortschritt |
| Accent | `#0077CC` | Informationen, Links |
| Navy | `#0D1B2A` | Dark-Mode-Flächen |
| Warning | `#F59E0B` | Hinweise |
| Danger | `#EF4444` | Löschen und Fehler |

## MDS-02 – Typografie

- Schriftfamilie: Inter/Systemschrift
- Mindestgröße Fließtext: 16 px
- Überschriften: deutlich, kurz und linksbündig
- Keine langen Texte in Großbuchstaben

## MDS-03 – Buttons

Es gibt vier verbindliche Buttonarten:

- Primary
- Secondary
- Danger
- Icon

Mindestgröße aller Bedienelemente: 48 × 48 px.

## MDS-04 – Karten

- Radius: 28 px
- dezente Schatten
- klare Gruppierung
- maximal eine Hauptaktion pro Karte

## MDS-05 – Navigation

Hauptnavigation:

1. Start
2. Einnahmen
3. Schrank
4. Kalender
5. Mehr

Kritische Änderungen bleiben im PIN-geschützten Admin-Bereich.

## MDS-06 – Dialoge

- einheitlicher Hintergrund
- klare Überschrift
- Abbrechen und Bestätigen getrennt
- bei Medikamentenänderungen immer Prüfansicht

## MDS-07 – Formulare

- Labels oberhalb der Felder
- Mindesthöhe 48 px
- verständliche Fehlermeldungen
- keine kritische Änderung ohne Bestätigung

## MDS-08 – Icons

SVG-Line-Icons aus `assets/icons/ui-icons.svg`.

## MDS-09 – Animationen

- Dauer 160–240 ms
- keine verspielten Effekte
- `prefers-reduced-motion` wird berücksichtigt

## MDS-10 – Responsive Design

- Smartphone zuerst
- Tablet und Desktop nutzen mehrspaltige Ansichten
- Bottom Navigation bleibt erreichbar
