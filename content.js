(function () {
  "use strict";

  const STORAGE_KEY = "planviewTimeDefaults";
  const panelId = "planview-time-helper";

  if (document.getElementById(panelId)) {
    return;
  }

  const styles = document.createElement("style");
  styles.textContent = `
    #${panelId} { position: fixed; z-index: 2147483647; top: 18px; right: 18px; width: 290px; padding: 16px; color: #17202a; background: #f8fafb; border: 1px solid #9aa7b2; border-radius: 8px; box-shadow: 0 10px 30px rgba(23,32,42,.22); font: 14px/1.35 system-ui, sans-serif; }
    #${panelId} h2 { margin: 0 0 4px; font-size: 17px; }
    #${panelId} p { margin: 0 0 12px; color: #52606d; font-size: 12px; }
    #${panelId} label { display: block; margin: 9px 0 4px; font-weight: 600; }
    #${panelId} input, #${panelId} select { box-sizing: border-box; width: 100%; padding: 7px 8px; border: 1px solid #aeb8c2; border-radius: 4px; background: white; color: inherit; font: inherit; }
    #${panelId} .pth-actions { display: flex; gap: 8px; margin-top: 14px; }
    #${panelId} button { flex: 1; padding: 8px 10px; border: 0; border-radius: 4px; cursor: pointer; font: 600 13px system-ui, sans-serif; }
    #${panelId} .pth-fill { background: #176b87; color: white; }
    #${panelId} .pth-scan { background: #dce5ea; color: #17202a; }
    #${panelId} .pth-status { min-height: 18px; margin-top: 10px; color: #52606d; font-size: 12px; }
  `;
  document.documentElement.appendChild(styles);

  const panel = document.createElement("section");
  panel.id = panelId;
  panel.innerHTML = `
    <h2>Planview Time Helper</h2>
    <p>Fill one existing work row. Review the page and submit it yourself.</p>
    <label for="pth-work">Work item</label>
    <select id="pth-work"></select>
    <label for="pth-entry-type">Entry type</label>
    <select id="pth-entry-type">
      <option value="daily">Daily</option>
      <option value="weekly">Weekly total</option>
    </select>
    <label for="pth-date">Day</label>
    <select id="pth-date"></select>
    <label for="pth-hours">Hours</label>
    <input id="pth-hours" type="text" inputmode="decimal" placeholder="e.g. 7.5 or 7:30">
    <div class="pth-actions">
      <button class="pth-scan" type="button">Scan page</button>
      <button class="pth-fill" type="button">Fill form</button>
    </div>
    <div class="pth-status" role="status"></div>
  `;
  document.body.appendChild(panel);

  const fields = {
    work: panel.querySelector("#pth-work"),
    entryType: panel.querySelector("#pth-entry-type"),
    date: panel.querySelector("#pth-date"),
    hours: panel.querySelector("#pth-hours")
  };
  const status = panel.querySelector(".pth-status");

  const setStatus = (message) => {
    status.textContent = message;
  };

  const saveDefaults = () => {
    const values = Object.fromEntries(Object.entries(fields).map(([key, input]) => [key, input.value]));
    chrome.storage.local.set({ [STORAGE_KEY]: values });
  };

  const setOptions = (select, options, selectedValue) => {
    select.replaceChildren(...options.map(({ value, label }) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      option.selected = value === selectedValue;
      return option;
    }));
  };

  const workRows = () => Array.from(document.querySelectorAll("#timesheet tbody tr.workRow"))
    .map((row) => ({
      row,
      id: row.querySelector("input[id$='###weekly']")?.id.split("###")[0],
      label: row.querySelector(".descrCol span[title]")?.textContent.trim() || row.querySelector(".descrCol")?.textContent.trim()
    }))
    .filter((item) => item.id && item.label);

  const dayOptions = () => Array.from(document.querySelectorAll("#timesheet thead th.dailyCol time"))
    .map((time, index) => ({ value: String(index), label: time.textContent.trim(), date: time.dateTime }));

  const loadPageOptions = (saved = {}) => {
    const works = workRows();
    setOptions(fields.work, works.map(({ id, label }) => ({ value: id, label })), saved.work);
    const days = dayOptions();
    setOptions(fields.date, days.map(({ value, label }) => ({ value, label })), saved.date || days[0]?.value);
    fields.entryType.value = saved.entryType || "daily";
    fields.date.disabled = fields.entryType.value === "weekly";
    fields.hours.value = saved.hours || "";
    setStatus(`Ready: ${works.length} work item${works.length === 1 ? "" : "s"}, ${days.length} days.`);
  };

  chrome.storage.local.get(STORAGE_KEY, (result) => {
    const values = result[STORAGE_KEY] || {};
    loadPageOptions(values);
  });

  Object.values(fields).forEach((input) => input.addEventListener("change", saveDefaults));

  const setNativeValue = (element, value) => {
    const prototype = Object.getPrototypeOf(element);
    const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
    if (descriptor && descriptor.set) {
      descriptor.set.call(element, value);
    } else {
      element.value = value;
    }
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const scan = () => {
    loadPageOptions({ work: fields.work.value, entryType: fields.entryType.value, date: fields.date.value, hours: fields.hours.value });
  };

  const fill = () => {
    const selectedWork = workRows().find(({ id }) => id === fields.work.value);
    const selectedDay = Number(fields.date.value);
    const value = fields.hours.value.trim();
    if (!selectedWork || !value) {
      setStatus("Choose a work item and enter hours first.");
      return;
    }
    const target = fields.entryType.value === "weekly"
      ? selectedWork.row.querySelector("input[id$='###weekly']")
      : selectedWork.row.querySelectorAll("td.dailyCol input")[selectedDay];
    if (!target) {
      setStatus("The selected time cell was not found. Refresh the page and scan again.");
      return;
    }
    setNativeValue(target, value);
    saveDefaults();
    const location = fields.entryType.value === "weekly" ? "weekly total" : fields.date.selectedOptions[0].textContent;
    setStatus(`Filled ${selectedWork.label} (${location}): ${value}. Review before submitting.`);
  };

  fields.entryType.addEventListener("change", () => {
    fields.date.disabled = fields.entryType.value === "weekly";
    saveDefaults();
  });
  panel.querySelector(".pth-scan").addEventListener("click", scan);
  panel.querySelector(".pth-fill").addEventListener("click", fill);
})();