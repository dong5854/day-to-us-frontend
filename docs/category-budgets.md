# Category budgets

The calendar's budget filter and Settings open `/categories?month=YYYY-MM`. The calendar remains mounted while this page is open so its view, filters and unsaved form fields survive a return. The shared layout restores scroll positions per route.

The overview uses the same dated budget entries as the existing ledger. Income, savings and recurring source definitions are not added to expense totals. Uncategorized and archived-category expenses remain part of the selected month's total. Each category detail shows a compact six-month spending chart and an exact monthly spending/budget list. Older months load in six-month batches without changing the selected month. Selecting a row updates the summary and collapsed transaction details while retaining the expanded list. The chart keeps a stable six-month window when selecting within it and shows the older window when selecting an earlier month. Zero budgets and unset budgets are distinct, and failed history requests keep existing rows available for retry.

Budgets are optional whole-won amounts. Zero is a real budget; null explicitly clears one. A monthly override wins over the latest recurring rule at or before that month. Repeating a change writes an override for the selected month and a recurring rule; later explicit overrides and past months remain unchanged. Past months allow monthly overrides only.

Category order is shared across the space and saved explicitly. Category creation stays available inside entry forms; rename, reorder, archive, restore and unused-category deletion live in management. Archived categories remain on historical entries but cannot be assigned to new entries. A category referenced by a recurring source must first be reassigned using the linked editor. Used categories cannot be deleted.

Validation: `NODE_OPTIONS=--no-experimental-webstorage npm run test:run` (the flag is needed only on Node versions exposing experimental global Web Storage), `npm run build`. Browser smoke checks cover a 390px mobile viewport, budget and order saves, returning to list/filter state, and retaining an unsaved amount after opening management.

Deploy the backend category-budget migration and API before this frontend. Existing PWA clients receive the update through the existing update prompt.
