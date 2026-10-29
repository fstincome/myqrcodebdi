# Project rules

- Keep camera lifecycle in `useQrScanner`, serializing start and stop and releasing streams on departure; this prevents overlapping permission requests and leaked cameras.
- The html5-qrcode target must be an empty element with React content rendered as siblings; the library replaces its children and otherwise crashes React reconciliation.
- Record successful QR link events through the validated public record-qr-event function, using event IDs for idempotent retries; never expose read access with the public writer.
- Keep administrator roles in the protected user_roles table and enforce history reads with has_role in RLS; browser guards are presentation only.
- Do not add profile tables unless user-facing profile data is requested; authentication and roles are independent of profiles.
- Load history statistics using exact count-only queries under the existing administrator RLS, independently of list filters and pagination; this avoids partial totals and exposing history publicly.