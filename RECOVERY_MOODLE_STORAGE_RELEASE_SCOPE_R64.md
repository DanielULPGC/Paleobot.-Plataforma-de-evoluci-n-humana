# PaleoBot — Recovery R64
## Moodle Storage Release Contract & Scope Injection

R64 makes resource scoping automatic without adding inline JavaScript.

### Deployment contract
Default:
`<meta name="paleobot-storage-scope" content="auto">`

External resolver:
`assets/js/00-core/074-paleobot-storage-scope.js`

The resolver is a deferred script in `<head>`, so it precedes the later deferred
PaleoBot application scripts while preserving the established body order:
`001 error -> 072 facade -> 002 core -> 073 storage adapter`.

### Precedence
1. existing `window.PALEOBOT_STORAGE_SCOPE`
2. explicit non-`auto` meta value
3. automatic scope from `location.origin + location.pathname`

Query parameters and URL hash are intentionally excluded.

### Auto scope
Format:
`auto-<deterministic FNV-1a hash>`

It is a namespace, not an authentication/security boundary.

### Isolation proof
Two simulated resources sharing the same browser storage but different paths:
- scope A: `auto-0hktd0f`
- scope B: `auto-0q0jfhs`

The same logical note/ticket keys store different values.
Clearing resource A leaves resource B intact.

Isolation harness:
20/20 PASS

Release scope harness:
18/18 PASS

### Regression
- R63: 28/28 PASS
- adapter denied-storage: 18/18 PASS
- integral: 660/660 PASS
- current cross-module: 147/147 PASS
- current boot: 22/22 PASS
- R57: 24/24 PASS
- R58: 24/24 PASS
- R60: 26/26 PASS
- JS syntax: 65/65 PASS
- executable stopImmediatePropagation: 0
- executable showDetail: 5
- scientific/didactic hashes: UNCHANGED

### Claim limits
No Moodle user/server persistence is implemented.
Target Moodle integration and browser/visual validation remain pending.

### Next
R65 — external dependency and self-containment audit for Moodle.
