# Verification

Verified on 2026-10-01.

## Automated

11 Node.js test cases pass, including all 18 same-author fixture labels. These are synthetic regression checks, not independently measured business accuracy.

## Browser

- Opened the application under a subdirectory to check GitHub Pages relative paths.
- Ran the INV-009 scripted investigation and placed the case on hold.
- Saved price 100 and an additional receipt for five units with fictional evidence and a correction reason.
- Confirmed approval was disabled before recheck.
- Rechecked to Matched, then approved with a review note.
- Confirmed case history contains the original price, correction, receipt and final decision.
- Reloaded and confirmed the approved state persisted.
- Inspected the original/current source table and both receipt rows.
- Followed the supplier graph node and observed related invoices and orders.
- Opened INV-013, confirmed the duplicate comparison with INV-012 and disabled approval, then rejected it with a review note.
- Reset the browser demo and confirmed the initial 12 exceptions, six matches and 59 graph entities were restored.

No live AI service or SAP environment was tested. The original Python application's database was not used or modified by this browser demo.
