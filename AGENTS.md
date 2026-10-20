# Project rules

- Keep camera lifecycle in `useQrScanner`, serializing start and stop and releasing streams on departure; this prevents overlapping permission requests and leaked cameras.
- The html5-qrcode target must be an empty element with React content rendered as siblings; the library replaces its children and otherwise crashes React reconciliation.