# Planview Time Helper

This local Chrome/Edge extension fills an existing work row and one daily time cell on the Planview Report Time page. It does not submit forms, make API calls, or store credentials.

## Install locally

1. Open `chrome://extensions` or `edge://extensions` in the browser that IT permits.
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select this folder.
4. Open the Planview Report Time page. The helper appears in the upper-right corner.
5. Choose an **Entry type**, choose an **Activity**, then choose **Fill**. Daily mode uses checkboxes for the currently rendered days; weekly mode fills the table's **Weekly** column. Vacation, Absence, and Training / conference templates let you choose a number of currently available days and fill the configured default hours per selected day. Public holidays automatically load the selected country's holidays for the current year, use the cached result on later uses, and reapply matching holidays when you switch Planview weeks. **Clear** clears editable time-entry cells in the current Planview table while leaving the helper settings and selections unchanged. It does not submit the timesheet. Review Planview's values and submit there.

The extension currently targets only the URL in `manifest.json`. If your permitted browser uses a different Planview hostname, update the `matches` entry before loading it.

## Current limitation

The Report Time page is a timesheet grid rather than a conventional form. The helper reads existing rows from `#timesheet tbody tr.workRow`, reads dates from the table header, and fills the matching daily input. Templates match rows containing `Vacation`, `Absence`, or `Training` / `Conference`; Public holidays matches a row containing `Public Holiday` or `Holiday`. The matching activity must already be on the timesheet. Daily and template modes only offer dates currently rendered in the table, so month-end boundaries and shortened weeks are handled without assuming five working days. Holiday data is fetched from the public Timeanddate holiday page for the country and year shown by Planview, then cached locally by country/year. The helper does not add activities, fill remarks, or click **Sign and Submit**.

The attached page source contains account and session-sensitive values. Do not share a fresh source capture or request headers; the helper only needs the rendered page in your permitted browser.