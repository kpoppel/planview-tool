# Planview Time Helper

This local Chrome/Edge extension fills an existing activity row and daily or weekly time cells on the Planview Report Time page. It does not submit forms, make API calls, or store credentials.

## Install locally

1. Open `chrome://extensions` or `edge://extensions` in the browser that IT permits.
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select this folder.
4. Open the Planview Report Time page. The helper appears in the upper-right corner.
5. Choose an **Entry type** from the available activities, choose **Daily** or **Weekly**, enter the hours, then choose **Fill**. Daily mode uses checkboxes for the currently rendered days; weekly mode hides the day checkboxes and fills the table's **Weekly** column with the entered total. **Clear** clears editable time-entry cells in the current Planview table while leaving the helper settings and selections unchanged. It does not submit the timesheet. Review Planview's values and submit there.
6. Choose **New template** to define a named daily or weekly template. Daily templates have a Monday-Friday hours column for every activity; weekly templates have one weekly total per activity. Save it, then select the template from **Entry type** to fill all configured activities at once. Daily filling matches each rendered Planview date to the corresponding template weekday, even when only one day such as Monday is shown. Weekly totals are prorated by the number of visible working weekdays, so a one-day table receives one fifth of the weekly total. Templates and the default-template setting are stored in the page's browser `localStorage`; choose **Edit selected** to update one.
7. Expand **Settings** to set standard working-day hours and the public-holiday country. The helper loads holidays for the year shown by Planview. Holiday dates override template values: normal template activities are left empty on those dates, while the Planview **Public Holidays** activity receives the configured standard-day hours.

The extension currently targets only the URL in `manifest.json`. If your permitted browser uses a different Planview hostname, update the `matches` entry before loading it.

## Current limitation

The Report Time page is a timesheet grid rather than a conventional form. The helper reads existing rows from `#timesheet tbody tr.workRow`, reads dates from the table header, and fills the selected activity's daily or weekly input. The matching activity must already be on the timesheet. Daily mode only offers dates currently rendered in the table, so month-end boundaries and shortened weeks are handled without assuming five working days. The helper does not add activities, fill remarks, or click **Sign and Submit**.

The attached page source contains account and session-sensitive values. Do not share a fresh source capture or request headers; the helper only needs the rendered page in your permitted browser.

## Custom templates

A template records the exact set of activity IDs present when it was saved. When an activity is added or removed, the template is labeled **needs update** and Fill is blocked until it is edited against the current activity list. This prevents hours from being silently applied to the wrong set of activities after projects change. Existing weekly templates continue to use their stored per-activity totals; edit them to create a new daily schedule.