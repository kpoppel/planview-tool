# Planview Time Helper

This local Chrome/Edge extension fills an existing activity row and daily or weekly time cells on the Planview Report Time page. It does not submit forms, make API calls, or store credentials.

## Install locally

1. Open `chrome://extensions` or `edge://extensions` in the browser that IT permits.
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select this folder.
4. Open the Planview Report Time page. The helper appears in the upper-right corner.
5. Choose an **Entry type** from the available activities, choose **Daily** or **Weekly**, enter the hours, then choose **Fill**. Daily mode uses checkboxes for the currently rendered days; weekly mode hides the day checkboxes and fills the table's **Weekly** column with the entered total. **Clear** clears editable time-entry cells in the current Planview table while leaving the helper settings and selections unchanged. It does not submit the timesheet. Review Planview's values and submit there.

The extension currently targets only the URL in `manifest.json`. If your permitted browser uses a different Planview hostname, update the `matches` entry before loading it.

## Current limitation

The Report Time page is a timesheet grid rather than a conventional form. The helper reads existing rows from `#timesheet tbody tr.workRow`, reads dates from the table header, and fills the selected activity's daily or weekly input. The matching activity must already be on the timesheet. Daily mode only offers dates currently rendered in the table, so month-end boundaries and shortened weeks are handled without assuming five working days. The helper does not add activities, fill remarks, or click **Sign and Submit**.

The attached page source contains account and session-sensitive values. Do not share a fresh source capture or request headers; the helper only needs the rendered page in your permitted browser.