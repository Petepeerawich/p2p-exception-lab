# P2P Lab

An interactive procure-to-pay portfolio demo. Explore invoice exceptions, follow business relationships in a typed evidence graph, correct synthetic documents and record a human review decision.

All records and policies are fictional. There is no SAP connection. The investigation is scripted, not a live AI agent. The demo never posts an invoice, makes a payment or sends a message.

## Try the workflow

1. Choose **02 · Resolve an exception** to open INV-009.
2. Investigate the price and receipt exceptions. Enter a decision note and choose **Hold for review**.
3. Open **Correct documents**. Use price `100`, quantity `10`, and additional received units `5`.
4. Enter fictional evidence `DEMO-CORRECTED-INVOICE-009 / DEMO-DELIVERY-009` and a reason for the correction. This lesson assumes a corrected supplier invoice and verified delivery of the remaining five units. Do not invent receipts in a real process.
5. Save the correction. Approval stays blocked until **Recheck documents** passes.
6. Review the before/after source records. Add a decision note and choose **Approve matched case**.
7. Open **Case history** or **Export history** to inspect the sequence.

The other guided cases demonstrate a clean invoice and a duplicate supplier reference. Reset demo clears only this site's browser history and restores the original fixtures.

## Implementation

The static HTML, CSS and JavaScript run in a modern browser. No package installation, API key, paid domain or application server is needed for visitors. Each browser stores its own action log in localStorage. Actions are validated and replayed on reload. Original fixture files are immutable during use. Updates to the site do not copy one visitor's decisions to another visitor.

`core.js` checks prices using integer cents with BigInt, including the exact two percent tolerance boundary. Quantities must be positive whole units in this version. Supplier, currency, material, order, receipt, quantity and duplicate-reference checks are deterministic. The first observed supplier reference is canonical.

The graph contains typed nodes and named relationships. The original fixtures produce 59 nodes and 91 edges. New receipts add graph evidence. Selecting a supplier reveals connected invoices and orders. Selecting an invoice reveals its source documents and any duplicate reference.

The scripted investigation retrieves invoice context, computes matching findings, selects related graph evidence and reads the fictional policy. It uses a fixed sequence and template recommendations. It makes no model calls.

Corrections require a reason and fictional evidence reference. They invalidate matching results for affected cases. Approval requires a fresh successful check. Approved and rejected cases are locked. Receipt changes are blocked when a related invoice has a final decision. History retains the before/after invoice, additional receipt and matching results.

## Verification

Run `npm test` with Node.js 20 or newer. No dependency installation is required.

The suite checks all 18 original same-author fixtures, exact price boundaries, correction and approval transitions, partial fixes, duplicate blocking, final locks, invalid input atomicity, shared receipt effects, graph updates and history replay. These deliberately constructed fixtures are not an independent test set. No production accuracy or time savings are claimed.

See `VERIFICATION.md` for browser checks.

## Local preview and hosting

Serve this directory with any static HTTP server and open its URL. Opening index.html directly as a file will not load the JSON fixture. All asset links are relative so the site can run in a GitHub Pages repository subdirectory.

GitHub Pages can host this static project from the main branch root. It has no application backend or shared database. The original Python and SQLite application is maintained separately and is not included in this public browser-demo repository.

## Limits and data handling

Use only fictional data in this demo. Browser history is editable and can be cleared. It is not a tamper-proof audit log, authentication system or shared team workflow. Browser storage failures are reported, and history can be exported as JSON. The public host receives ordinary website requests, but the application does not send your case edits to a server or use analytics.

This version assumes one material per order. It does not handle tax, discounts, multi-line invoices, credit notes, OCR, FX conversion, real ERP integration or aggregate billing across separate invoice references. It restricts receipt additions to the order quantity. Supplier, currency, material and invoice references are intentionally not editable in the correction form. Some exceptions therefore require hold or reject rather than a correction in this demo.

## Portfolio positioning

Describe this as an independent synthetic-data project. Demonstrated skills include deterministic matching automation, typed knowledge-graph evidence retrieval, human review, correction history and static deployment. Do not describe it as production SAP experience or a deployed live AI agent.
