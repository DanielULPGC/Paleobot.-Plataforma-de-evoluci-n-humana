# PaleoBot — Recovery R93
## Moodle Target Execution Intake & Adjudication Gate

R93 closes in `AWAITING_TARGET_EXECUTION`.

No completed authentic target-return dossier was found in the accessible corpus. The
only R91 target-result documents found are NOT_RUN templates/placeholders.

### Intake gate
Required evidence:
- `paleobot-r91-target-result.json`
- `response-headers.json`
- `paleobot-target-probe.json`
- `csp-console.json`
- `environment.json`

The return manifest binds the evidence to:
- R92 candidate SHA-256:
  `b5223e16a72ec3135c3770166b6a6717ecd2628f7cf31eca19248f8b579a22c8`
- R92 operator handoff SHA-256:
  `dbeb3f471165666b88daf2ec868c29e30f1a98add9174256dbe7172d1731ab1f`

### Fail-closed behavior
The R93 synthetic harness validates 15/15 cases:
- empty inbox -> AWAITING;
- synthetic PASS/FAIL/BLOCKED;
- synthetic return rejected in real mode;
- required evidence absence -> quarantine;
- wrong release hash -> quarantine;
- tampering -> quarantine;
- ZIP traversal -> quarantine;
- multiple ambiguous returns -> quarantine;
- PASS contradicted by X-Frame-Options -> FAIL;
- PASS contradicted by CSP violation -> FAIL;
- NOT_RUN packaging refused;
- likely secret packaging refused.

Synthetic PASS never promotes the project.

### Current adjudication
`AWAITING_TARGET_EXECUTION`

### Regression
R92/R91/R90/R89/R87 current gates remain PASS. Runtime `index.html` + `assets/` is
byte-identical to R92, so the R92 660/660 and 147/147 results remain applicable.

### Promotion rule
Only a completed REAL_TARGET return that survives manifest admission, R91 case
reconciliation and external evidence checks can produce `ADJUDICATED_PASS`.

R93 does not claim `MOODLE_INTEGRATION_PASS`.

Gate:
`R93_MOODLE_TARGET_EXECUTION_INTAKE_ADJUDICATION_GATE_READY__NO_AUTHENTIC_TARGET_RETURN_FOUND_IN_ACCESSIBLE_CORPUS__CURRENT_STATE_AWAITING_TARGET_EXECUTION__CANDIDATE_R92_SHA_B5223E16_RETAINED__OPERATOR_HANDOFF_R92_SHA_DBEB3F47_RETAINED__RETURN_MANIFEST_HASH_AND_SIZE_VALIDATION_READY__ZIP_PATH_TRAVERSAL_AND_SYMLINK_REJECTION_READY__REQUIRED_EVIDENCE_TARGET_RESULT_HEADERS_PROBE_CSP_CONSOLE_ENVIRONMENT__R91_CASE_SEMANTICS_AND_TOPOLOGY_REQUIRED_FLAGS_VALIDATED__PASS_FAIL_BLOCKED_NOT_RUN_DECLARED_COMPUTED_RECONCILIATION_READY__PASS_EXTERNAL_EVIDENCE_FRAME_ANCESTORS_XFO_PROBE_STORAGE_CSP_VALIDATION_READY__REAL_TARGET_RESERVED_OR_LOCALHOST_GUARD_READY__SYNTHETIC_FIXTURES_REQUIRE_EXPLICIT_ALLOW_FLAG__RETURN_PREPARER_SECRET_SCAN_AND_NOT_RUN_REFUSAL_READY__R93_SYNTHETIC_HARNESS_15_PASS__R92_40_PASS__R91_66_PASS__R91_CONFIG_12_PASS__R90_STORAGE_24_PASS__R90_PATH_16_PASS__R89_46_PASS__R87_27_PASS__660_PASS_RETAINED__147_PASS_RETAINED__BOOT_22_PASS_RETAINED__65_APP_JS_RETAINED__LEAFLET_SYNTAX_RETAINED__SCIENCE_DIDACTIC_UNCHANGED__RUNTIME_UNCHANGED_FROM_R92__NO_MOODLE_INTEGRATION_PASS_CLAIM__TARGET_EXECUTION_REQUIRED_FOR_PROMOTION__R94_CONTROLLED_TARGET_EXECUTION_HOLD_AND_R93_REOPENING_PROTOCOL_NEXT`

Next:
R94 — Controlled Target Execution Hold & R93 Reopening Protocol, unless an authentic
target return arrives first; in that case R93 must be reopened and adjudicated.
