# Planview Time Helper

This local Chrome/Edge extension fills an existing work row and one daily time cell on the Planview Report Time page. It does not submit forms, make API calls, or store credentials.

## Install locally

1. Open `chrome://extensions` or `edge://extensions` in the browser that IT permits.
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select this folder.
4. Open the Planview Report Time page. The helper appears in the upper-right corner.
5. Choose a **Work item**, choose a **Day**, enter hours such as `7.5` or `7:30`, then choose **Fill form**. Review Planview's values and submit there.

The extension currently targets only the URL in `manifest.json`. If your permitted browser uses a different Planview hostname, update the `matches` entry before loading it.

## Current limitation

The Report Time page is a timesheet grid rather than a conventional form. The helper reads existing rows from `#timesheet tbody tr.workRow`, reads dates from the table header, and fills the matching daily input. It does not add work items, fill remarks, or click **Sign and Submit**.

The attached page source contains account and session-sensitive values. Do not share a fresh source capture or request headers; the helper only needs the rendered page in your permitted browser.