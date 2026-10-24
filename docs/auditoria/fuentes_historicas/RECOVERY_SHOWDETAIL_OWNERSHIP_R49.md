# PaleoBot — Recovery R49
## Direct showDetail ownership classification

R49 is an evidence-only checkpoint. No application runtime code is changed.

### Metric correction
R48 reported 20 textual `showDetail(` matches. R49 reconciles them as:
- executable invocations: **18**
- canonical renderer uses: **4**
- legitimate compatibility fallbacks: **9**
- confirmed residual bypasses: **5**
- function definition: **1**
- comment-only match: **1**

### Confirmed residual bypasses for R50
- SD01 core:1473 — generic `[data-open-species]` click
- SD02 core:2020 — keyboard activation of `[data-open-species]`
- SD13 core:8820 — quiz -> detail
- SD15 core:11340 — stats/encephalization chart -> detail
- SD16 core:15535 — presentation -> detail

These are genuine opening actions and should route through `PaleoBot.openSpecies`.

### Calls that must not be removed mechanically
Canonical renderer:
- SD11 — educational-level rerender
- SD14 — arrow navigation inside detail
- SD17 — panel previous/next navigation
- SD18 — public facade implementation itself

Legitimate fallbacks:
- SD03–SD10 — surface helpers that first try public API
- SD19 — v40 fallbackDetail after public API attempt

Non-calls:
- SD12 — `function showDetail(sp)` declaration
- SD20 — search comment explicitly saying it does not call showDetail directly

### Verification
- classification anchors: PASS
- ownership evidence: PASS
- integral regression: 660/660 PASS
- JS syntax: 63/63 PASS
- executable stopImmediatePropagation: 0
- scientific/didactic integrity: UNCHANGED
- runtime changes: none
- browser: VISUAL_PENDING

### Gate
`DIRECT_SHOWDETAIL_CLASSIFICATION_PASS__20_RAW_RECONCILED_TO_18_INVOCATIONS__CANONICAL_4__FALLBACK_9__RESIDUAL_BYPASS_5__NONCALL_2__660_PASS__63_JS_PASS__ZERO_IMMEDIATE_RETAINED__RUNTIME_UNCHANGED__VISUAL_PENDING`

### Next
R50 — migrate only SD01, SD02, SD13, SD15 and SD16 through the public opening API, preserving each flow's modal, focus, tab and timing semantics.
