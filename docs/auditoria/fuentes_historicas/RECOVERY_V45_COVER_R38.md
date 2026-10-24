# PaleoBot — Recovery R38
## retirada completa de v45 cover-navigation

La portada ya usa contratos canónicos:
- `data-view` -> core `switchView()`
- `data-action` -> core `getActionContractMap()`

Todos los destinos de portada resuelven a vistas existentes y las acciones
`abrirBiblio` / `activateClassMode` existen en core.

v45 no tenía API exportada ni consumidores de sus marcadores
`v45CoverLastView` / `v45CoverLastAction`.

Core ya desplaza a `#main-content` cuando el trigger procede de `.main-cover`.
v55-nav conserva además el ocultado de `.paleobot-cover-v45` después de navegar.

Regresión:
- integral: 660/660 PASS
- focused: 18/18 PASS
- JS: 64/64 PASS

Deuda comparable: 15 -> 14
Ejecutables: 9
showDetail: 20 -> 20

Estado:
V45=REMOVED
COVER_VIEW_OWNER=core
COVER_ACTION_OWNER=core
LANDING_HANDOFF=v55-nav
VISUAL_PENDING
