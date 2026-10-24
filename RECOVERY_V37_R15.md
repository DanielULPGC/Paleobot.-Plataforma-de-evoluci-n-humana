# PaleoBot — Recovery R15
## Poda parcial de v37: de bus global a adaptador de compatibilidad

### Decisión
No se elimina `v37-control-bus.js` porque v50/v51/v56 todavía referencian sus
métodos públicos. Se elimina, en cambio, su ownership global de eventos.

Estado:
`PaleoBotV37Controls.mode = "compatibility-adapter"`

### Qué se retira
El listener global `document.addEventListener('click', ..., true)` de v37 y sus
ocho ramas con `stopImmediatePropagation()`:

1. cierre modal;
2. toggle modal;
3. back modal;
4. cierre de panel;
5. cierre de presentación;
6. cierre de mapa de presentación;
7. cambio de familia;
8. cambio de vista.

### Ownership alternativo verificado
Cada una de esas operaciones tiene al menos un propietario en núcleo o capas
posteriores. La matriz completa se conserva en `RECOVERY_V37_AUDIT_R15.json`.

### Qué se conserva
- `setFamily()`
- `switchView()`
- `runAction()`
- `setModal()`

Esto mantiene compatibilidad con v50, v51 y el monkey-patch v56.

### Regresión
- integral: 660/660 PASS;
- adaptador v37: 6/6 PASS;
- JS aplicación: 69/69 PASS.

### Integridad científica
DB, SITES, ITINERARIES y DISPERSAL_ROUTES:
`UNCHANGED`.

### Deuda técnica
`stopImmediatePropagation()`:
102 -> 94 (−8)

llamadas directas `showDetail()`:
21 -> 21 (−0)

### Estado de v37
`GLOBAL_EVENT_OWNER = false`
`COMPATIBILITY_ADAPTER = true`

### Navegador real
La regresión visual completa sigue pendiente por el bloqueo del entorno
documentado en R12.
