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
    #${panelId} .pth-mode { display: flex; gap: 8px; margin-top: 10px; }
    #${panelId} .pth-mode label { flex: 1; margin: 0; padding: 7px 8px; border: 1px solid #aeb8c2; border-radius: 4px; background: white; cursor: pointer; text-align: center; }
    #${panelId} .pth-mode input { width: auto; margin: 0 5px 0 0; }
    #${panelId} .pth-settings { margin-top: 14px; border-top: 1px solid #d3dbe1; padding-top: 10px; }
    #${panelId} .pth-settings summary { cursor: pointer; color: #52606d; font-size: 12px; font-weight: 600; }
    #${panelId} .pth-settings-content { padding-top: 4px; }
    #${panelId} .pth-day-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px 8px; max-height: 120px; overflow: auto; padding: 6px 0; }
    #${panelId} .pth-day-list label { margin: 0; font-weight: 400; white-space: nowrap; }
    #${panelId} .pth-day-list input { width: auto; margin-right: 5px; }
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
    <label for="pth-entry-type">Entry type</label>
    <select id="pth-entry-type">
    </select>
    <div class="pth-mode" role="radiogroup" aria-label="Entry frequency">
      <label><input type="radio" name="pth-mode" value="daily" checked>Daily</label>
      <label><input type="radio" name="pth-mode" value="weekly">Weekly</label>
    </div>
    <div class="pth-daily-options">
      <label>Days</label>
      <div id="pth-manual-day-list" class="pth-day-list"></div>
    </div>
    <label for="pth-hours">Hours</label>
    <input id="pth-hours" type="text" inputmode="decimal" value="7,4" placeholder="e.g. 7,4 or 7:30">
    <div class="pth-actions">
      <button class="pth-fill" type="button">Fill</button>
      <button class="pth-scan" type="button">Clear</button>
    </div>
    <div class="pth-status" role="status"></div>
  `;
  document.body.appendChild(panel);

  const fields = {
    activity: panel.querySelector("#pth-entry-type"),
    manualDayList: panel.querySelector("#pth-manual-day-list"),
    hours: panel.querySelector("#pth-hours")
  };
  const dailyOptions = panel.querySelector(".pth-daily-options");
  const modeInputs = Array.from(panel.querySelectorAll("input[name='pth-mode']"));
  const status = panel.querySelector(".pth-status");

  const setStatus = (message) => {
    status.textContent = message;
  };

  const saveDefaults = () => {
    const values = {
      work: fields.activity.value,
      mode: selectedMode(),
      hours: fields.hours.value,
      manualDays: selectedManualDays()
    };
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

  const weekdayDefaults = (days) => days.filter(({ date }) => {
    const day = new Date(`${date}T00:00:00Z`).getUTCDay();
    return day >= 1 && day <= 5;
  }).map(({ value }) => value);

  const selectedManualDays = () => Array.from(fields.manualDayList.querySelectorAll("input:checked"))
    .map((input) => input.value);

  const selectedMode = () => panel.querySelector("input[name='pth-mode']:checked").value;

  const updateManualDayList = (days, savedDays = []) => {
    fields.manualDayList.replaceChildren(...days.map(({ value, label }) => {
      const item = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = value;
      checkbox.checked = savedDays.includes(value);
      checkbox.addEventListener("change", saveDefaults);
      item.append(checkbox, document.createTextNode(label));
      return item;
    }));
  };

  const updateMode = () => {
    dailyOptions.style.display = selectedMode() === "daily" ? "block" : "none";
  };

  const loadPageOptions = (saved = {}) => {
    const works = workRows();
    setOptions(fields.activity, works.map(({ id, label }) => ({ value: id, label })), saved.work || fields.activity.value);
    const days = dayOptions();
    const savedManualDays = saved.manualDays?.length === days.length ? null : saved.manualDays;
    updateManualDayList(days, savedManualDays || weekdayDefaults(days));
    modeInputs.forEach((input) => { input.checked = input.value === (saved.mode || "daily"); });
    fields.hours.value = saved.hours || "";
    updateMode();
    setStatus(`Ready: ${works.length} work item${works.length === 1 ? "" : "s"}, ${days.length} days.`);
  };

  chrome.storage.local.get(STORAGE_KEY, (result) => {
    const values = result[STORAGE_KEY] || {};
    loadPageOptions(values);
  });

  [fields.activity, fields.hours].forEach((input) => input.addEventListener("change", saveDefaults));
  modeInputs.forEach((input) => input.addEventListener("change", () => { updateMode(); saveDefaults(); }));

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

  const fill = () => {
    const selectedWork = workRows().find(({ id }) => id === fields.activity.value);
    const value = fields.hours.value.trim();
    if (!selectedWork || !value) {
      setStatus("Choose a work item and enter hours first.");
      return;
    }
    if (selectedMode() === "daily") {
      const days = selectedManualDays();
      if (!days.length) {
        setStatus("Select at least one available day first.");
        return;
      }
      const targets = days.map((day) => selectedWork.row.querySelectorAll("td.dailyCol input")[Number(day)]).filter(Boolean);
      targets.forEach((target) => setNativeValue(target, value));
      saveDefaults();
      setStatus(`Filled ${selectedWork.label} on ${targets.length} day${targets.length === 1 ? "" : "s"}: ${value}. Review before submitting.`);
      return;
    }
    const target = selectedWork.row.querySelector("input[id$='###weekly']");
    if (!target) {
      setStatus("The selected time cell was not found. Refresh the page and scan again.");
      return;
    }
    setNativeValue(target, value);
    saveDefaults();
    const location = "weekly total";
    setStatus(`Filled ${selectedWork.label} (${location}): ${value}. Review before submitting.`);
  };

  const clearForm = () => {
    const timeInputs = document.querySelectorAll("#timesheet tbody tr.workRow td.entryBox input");
    timeInputs.forEach((input) => setNativeValue(input, ""));
    setStatus(`Cleared ${timeInputs.length} Planview time entr${timeInputs.length === 1 ? "y" : "ies"}. Review before submitting.`);
  };

  panel.querySelector(".pth-scan").addEventListener("click", clearForm);
  panel.querySelector(".pth-fill").addEventListener("click", fill);

  let lastLocation = window.location.href;
  let lastTableSignature = "";
  let refreshTimer;
  const refreshForPlanviewNavigation = () => {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      const table = document.querySelector("#timesheet");
      const signature = table ? `${window.location.href}|${table.querySelector("thead")?.textContent}|${table.querySelectorAll("tbody tr.workRow").length}` : "";
      if (!signature || (window.location.href === lastLocation && signature === lastTableSignature)) return;
      lastLocation = window.location.href;
      lastTableSignature = signature;
      const saved = {
        work: fields.activity.value,
        mode: selectedMode(),
        hours: fields.hours.value,
        manualDays: selectedManualDays()
      };
      loadPageOptions(saved);
    }, 250);
  };
  const tableObserver = new MutationObserver(refreshForPlanviewNavigation);
  tableObserver.observe(document.querySelector("#timesheet") || document.body, { childList: true, subtree: true });
  window.addEventListener("popstate", refreshForPlanviewNavigation);
})();