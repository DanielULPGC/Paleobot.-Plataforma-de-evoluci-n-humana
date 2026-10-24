# PaleoBot — Recovery R57
## Moodle Path Normalization & Service-Worker Cleanup

R57 resolves the two immediate packaging blockers identified in R56.

### Dynamic CSS paths
Corrected:
- `assets/css/003-style.css` -> `assets/css/00-core/003-style.css`
- `assets/css/004-style.css` -> `assets/css/00-core/004-style.css`
- `assets/css/006-style.css` -> `assets/css/00-core/006-style.css`
- `assets/css/026-style.css` -> `assets/css/00-core/026-style.css`

Result:
- broken dynamic asset refs: 4 -> 0
- index local refs: 97/97 resolve

### Service Worker
Removed the registration of missing `./sw.js`.
No `sw.js` was fabricated.
The package now makes no PWA/offline ownership claim inside Moodle.

Result:
- runtime `serviceWorker` refs: 0
- runtime `localhost` refs: 0

### Moodle portability after R57
- `file://`: 0
- `window.top`: 0
- `window.parent` / parent DOM: 0
- root `/assets/`: 0
- root-relative src/href: 0

### Regression
- integral: 660/660 PASS
- cross-module: 147/147 PASS
- R55: 22/22 PASS
- current boot: 22/22 PASS
- R57 focused: 24/24 PASS
- JS syntax: 63/63 PASS
- executable stopImmediatePropagation: 0
- executable showDetail: 5
- scientific/didactic hashes: UNCHANGED

### Remaining Moodle work
Immediate path/SW blockers: 0.
Still pending:
1. script CSP hardening,
2. storage hardening,
3. external dependency policy,
4. target Moodle integration,
5. browser/visual validation.

### Gate
`MOODLE_PATH_NORMALIZATION_SW_CLEANUP_PASS__BROKEN_DYNAMIC_CSS_4_TO_0__SW_REGISTRATION_REMOVED__LOCALHOST_RUNTIME_2_TO_0__INDEX_LOCAL_97_PASS__NO_FILE_OR_PARENT_ASSUMPTIONS__660_PASS__FOCUSED_147_PASS__R55_22_PASS__CURRENT_BOOT_22_PASS__R57_24_PASS__63_JS_PASS__ZERO_IMMEDIATE_RETAINED__5_EXECUTABLE_SHOWDETAIL__SCIENCE_DIDACTIC_UNCHANGED__CSP_STORAGE_EXTERNAL_REVIEW_PENDING__MOODLE_INTEGRATION_PENDING__VISUAL_PENDING`

### Next
R58 — Moodle CSP hardening, script policy only.
