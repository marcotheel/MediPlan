# Datenmodell

## Person
- id
- name
- avatar
- active

## Medikament
- id
- personId
- name
- strength
- form
- dosageText
- times
- stock
- minStock
- image
- active

## Einnahme
- id
- medicationId
- personId
- date
- time
- amount
- status
- confirmedAt

## Termin
- id
- personId
- title
- date
- time
- location
- type
