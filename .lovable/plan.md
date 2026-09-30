# Admin "Stock List Update": paste, preview, publish

A new admin page (Catalog → Stock list update) where you paste your full stock list, check it in a preview table, then publish it to the website stock sheet in one click.

## How it works for you

1. Paste the full stock list: WhatsApp text, Excel/Sheets copy, or one item per line.
2. Click "Read list". A preview table shows each row: model name, category, brand, specs (processor, RAM, storage), quantity and price.
3. Each row is tagged:
   - New: will be added
   - Update: matches an existing product, so quantity and price get refreshed
   - Error: fix or remove before publishing
   You can edit any cell or remove a row before publishing.
4. A summary shows what will happen: X new, Y updated, Z will be hidden (not in the new list).
5. Click "Publish to website":
   - New items are added and shown on the website.
   - Matching items get the new quantity, price and "In Stock" status.
   - Products that are not in the new list are marked Out of Stock and hidden from the stock sheet. They are not deleted, so they come back automatically if a later list includes them.
6. Prices from the list are shown on the website. Rows without a price still show "Contact for Price".
7. Each publish is saved in the activity log with its counts.

## Matching rules
- An existing product matches when its SKU is the same, or when the normalised model name is the same (case, spacing and punctuation ignored).
- Category and brand are guessed from the text (Dell, HP, Lenovo, RAM, Processor, Monitor and so on). You can change them in the preview.

## Technical details
- New route `src/routes/_authenticated/admin.stock-update.tsx`, plus a nav item in AdminShell.
- New `src/lib/stock-update.functions.ts`:
  - `parseStockList` (admin only, via requireSupabaseAuth + is_admin). It reuses `parseDraftsFromText` from whatsapp-parse.server and adds a line/tab/CSV table parser for pasted spreadsheet rows. It returns rows annotated with the id of the matching product.
  - `publishStockList` (admin only). Input is the rows the admin confirmed, validated with zod. It upserts: inserts new products (is_active true, show_price true when a price exists, availability "In Stock", unique slug) and updates matched ones (price, stock_quantity, availability, is_active true). Every other active product is set to is_active false, availability "Out of Stock". Returns counts. All writes go through context.supabase so RLS admin policies apply.
- Products that came from earlier imports are included in the replace. Hidden products stay available in the admin Products list.
- Stock sheet and product listings already filter on is_active, so no public page changes are needed. Invalidate the `stock-sheet` query after publish.
- Add the task to roadmap.md.
