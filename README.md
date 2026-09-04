# Planview Time Helper

This local Chrome/Edge extension fills an existing work row and one daily time cell on the Planview Report Time page. It does not submit forms, make API calls, or store credentials.

## Install locally

1. Open `chrome://extensions` or `edge://extensions` in the browser that IT permits.
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select this folder.
4. Open the Planview Report Time page. The helper appears in the upper-right corner.
5. Choose a **Work item**, choose **Daily**, **Weekly total**, **Vacation**, **Absence**, **Training / conference**, or **Public holidays**, then choose **Fill form**. Daily mode fills one selected day; weekly mode fills the table's **Weekly** column. Templates let you choose a number of currently available days and fill `7,4` hours per selected day. For Public holidays, choose Denmark or Germany, choose **Load public holidays**, review the matching holidays in the current Planview table, then choose **Fill form**. Review Planview's values and submit there.

The extension currently targets only the URL in `manifest.json`. If your permitted browser uses a different Planview hostname, update the `matches` entry before loading it.

## Current limitation

The Report Time page is a timesheet grid rather than a conventional form. The helper reads existing rows from `#timesheet tbody tr.workRow`, reads dates from the table header, and fills the matching daily input. Templates match rows containing `Vacation`, `Absence`, or `Training` / `Conference`; Public holidays matches a row containing `Public Holiday` or `Holiday`. The matching work item must already be on the timesheet. Templates only offer dates currently rendered in the table, so month-end boundaries and shortened weeks are handled without assuming five working days. Holiday data is fetched from the public Timeanddate holiday page for the country and year shown by Planview. The helper does not add work items, fill remarks, or click **Sign and Submit**.

The attached page source contains account and session-sensitive values. Do not share a fresh source capture or request headers; the helper only needs the rendered page in your permitted browser.