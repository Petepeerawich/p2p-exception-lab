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

## Guided experience verification, 2026-10-08

- All 11 existing Node.js regression tests pass. Matching and approval rules are unchanged.
- Completed the four-step browser journey from investigation through approval.
- Tried a price-only correction with zero new receipts. Recheck returned to correction because the receipt shortfall remained.
- Applied the remaining five received units, rechecked successfully and approved with a review note.
- Reloaded and confirmed the completed case persisted.
- Opened the decision trail and confirmed both corrections, matching results and approval were present.
- Opened the duplicate case from the completion screen and confirmed its comparison evidence was visible.
- Cancelled replay reset and retained the completed case, then accepted reset and returned to step one.
- Inspected desktop and mobile viewport screenshots. At 390 pixels wide there was no horizontal overflow, and the first action was visible within an 844-pixel viewport.
- Screenshots are saved in the parent Output/output/playwright folder as guided-desktop-viewport.png and guided-mobile-viewport.png.

These checks used the local static preview. This revision has not been published to the public host.
