# PaleoBot — Recovery R89
## Moodle CSP Permission Minimization

R89 applies the permission reductions identified in R88.

### Removed
- `script-src https://api.anthropic.com`
- `img-src blob:`
- `img-src https://maps.wikimedia.org`
- `connect-src https://api.anthropic.com`
- `connect-src https://generativelanguage.googleapis.com`

### Added
- `form-action 'none'`
- `worker-src 'none'`
- `media-src 'none'`
- `manifest-src 'none'`

### Secure AI network default
The runtime now uses:
`connect-src 'self'`

Both AI fetch owners still use `window.PALEOBOT_CLAUDE_ENDPOINT`.
Therefore an external institutional proxy must be explicitly allow-listed by exact
origin at deployment time. The default profile intentionally blocks arbitrary
external endpoints.

### Preserved
- `style-src-attr 'none'`
- R87 external CSSOM registry architecture
- local Leaflet 1.9.4 unchanged
- `frame-src 'none'`
- `object-src 'none'`
- `base-uri 'self'`

### Moodle parent embedding
`frame-ancestors` is not inserted into the meta CSP. It must be configured as an
HTTP response header on the served PaleoBot resource using the exact authorized
Moodle parent origin(s).

### Verification
- R89: 46/46 PASS
- R87: 27/27 PASS
- R84 builder: 24/24 PASS
- R83: 18/18 PASS
- R82: 22/22 PASS
- R81: 28/28 PASS
- R75 slot: 20/20 PASS
- R72 CSSOM: 16/16 PASS
- integral: 660/660 PASS
- cross-module: 147/147 PASS
- boot: 22/22 PASS
- app JS: 65/65 PASS
- Leaflet syntax: PASS
- scientific/didactic: UNCHANGED

Historical R86/R88 policy harnesses are partially obsolete because R89 deliberately
changes the CSP values they were designed to freeze.

STATIC CSP MINIMIZATION PASS != BROWSER CSP ENFORCEMENT PASS != MOODLE INTEGRATION PASS.

Gate:
`R89_CSP_PERMISSION_MINIMIZATION_PASS__SCRIPT_SRC_ANTHROPIC_REMOVED__SCRIPT_SRC_SELF_ONLY__IMG_SRC_BLOB_REMOVED__IMG_SRC_MAPS_WIKIMEDIA_REMOVED__CONNECT_SRC_ANTHROPIC_AND_GOOGLE_GENAI_REMOVED__CONNECT_SRC_SELF_ONLY_SECURE_DEFAULT__EXTERNAL_AI_PROXY_REQUIRES_EXACT_DEPLOYMENT_ORIGIN_ALLOWLIST__FORM_ACTION_NONE_ADDED__WORKER_SRC_NONE_ADDED__MEDIA_SRC_NONE_ADDED__MANIFEST_SRC_NONE_ADDED__STYLE_SRC_ATTR_NONE_RETAINED__STYLE_SRC_AND_STYLE_SRC_ELEM_RETAINED__FRAME_SRC_NONE_RETAINED__OBJECT_SRC_NONE_RETAINED__FRAME_ANCESTORS_NOT_ADDED_TO_META__HTTP_RESPONSE_HEADER_REQUIREMENT_RETAINED__ONLY_INDEX_HTML_RUNTIME_CHANGED__LEAFLET_UNCHANGED__R89_46_PASS__R87_27_PASS__R84_24_PASS__R83_18_PASS__R82_22_PASS__R81_28_PASS__R75_20_PASS__R72_16_PASS__660_PASS__147_PASS__BOOT_22_PASS__R60_26_PASS__R63_28_PASS__R64_18_PASS__ISOLATION_20_PASS__R66A_22_PASS__R86_AND_R88_POLICY_HARNESSES_PARTIALLY_OBSOLETE_AFTER_R89__65_APP_JS_PASS__LEAFLET_SYNTAX_PASS__ZERO_IMMEDIATE__5_EXECUTABLE_SHOWDETAIL__FILE_PROTOCOL_0__LOCALHOST_RUNTIME_0__WINDOW_LOCATION_HREF_ASSIGN_0__WINDOW_TOP_0__WINDOW_PARENT_0__SCIENCE_DIDACTIC_UNCHANGED__STATIC_CSP_MINIMIZATION_PASS__EXTERNAL_PROXY_DEPLOYMENT_CONDITIONAL__TARGET_MOODLE_INTEGRATION_PENDING__BROWSER_CSP_ENFORCEMENT_PENDING__VISUAL_PENDING__ENVIRONMENT_BLOCKED_NOT_APPLICATION_FAILURE__R90_MOODLE_EMBEDDING_HEADER_AND_STORAGE_DEPLOYMENT_CONTRACT_NEXT`

Next:
R90 — Moodle Embedding Header & Storage Deployment Contract.
