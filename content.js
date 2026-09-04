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
    #${panelId} .pth-template-options { display: none; }
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
      <option value="daily">Daily</option>
      <option value="weekly">Weekly total</option>
      <option value="vacation">Vacation</option>
      <option value="absence">Absence</option>
      <option value="training">Training / conference</option>
      <option value="publicHoliday">Public holidays</option>
    </select>
    <label for="pth-work">Activity</label>
    <select id="pth-work"></select>
    <div class="pth-manual-options">
      <label>Days</label>
      <div id="pth-manual-day-list" class="pth-day-list"></div>
    </div>
    <div class="pth-template-options">
      <label for="pth-day-count">Number of days</label>
      <input id="pth-day-count" type="number" min="1" max="5" step="1" value="1">
      <label>Available days</label>
      <div id="pth-day-list" class="pth-day-list"></div>
    </div>
    <label for="pth-hours">Hours</label>
    <input id="pth-hours" type="text" inputmode="decimal" value="7,4" placeholder="e.g. 7,4 or 7:30">
    <div class="pth-actions">
      <button class="pth-fill" type="button">Fill</button>
      <button class="pth-scan" type="button">Clear</button>
    </div>
    <details class="pth-settings">
      <summary>Settings</summary>
      <div class="pth-settings-content">
        <label for="pth-country">Holiday country</label>
        <select id="pth-country">
          <option value="denmark">Denmark</option>
          <option value="germany">Germany</option>
        </select>
        <label for="pth-default-hours">Default hours</label>
        <input id="pth-default-hours" type="text" inputmode="decimal" value="7,4" placeholder="e.g. 7,4">
      </div>
    </details>
    <div class="pth-status" role="status"></div>
  `;
  document.body.appendChild(panel);

  const fields = {
    work: panel.querySelector("#pth-work"),
    entryType: panel.querySelector("#pth-entry-type"),
    date: panel.querySelector("#pth-date"),
    manualDayList: panel.querySelector("#pth-manual-day-list"),
    country: panel.querySelector("#pth-country"),
    dayCount: panel.querySelector("#pth-day-count"),
    dayList: panel.querySelector("#pth-day-list"),
    hours: panel.querySelector("#pth-hours"),
    defaultHours: panel.querySelector("#pth-default-hours")
  };
  const manualOptions = panel.querySelector(".pth-manual-options");
  const templateOptions = panel.querySelector(".pth-template-options");
  const status = panel.querySelector(".pth-status");

  const setStatus = (message) => {
    status.textContent = message;
  };

  const saveDefaults = () => {
    const values = {
      work: fields.work.value,
      entryType: fields.entryType.value,
      dayCount: fields.dayCount.value,
      hours: fields.hours.value,
      country: fields.country.value,
      defaultHours: fields.defaultHours.value,
      manualDays: selectedManualDays(),
      templateDays: selectedTemplateDays()
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

  const templateTerms = {
    vacation: ["vacation", "holiday", "leave"],
    absence: ["absence", "absent", "sick"],
    training: ["training", "conference"]
  };
  const holidayTerms = ["public holiday", "holiday"];
  let loadedHolidays = [];

  const findTemplateWork = (type, works) => works.find(({ label }) => {
    const normalized = label.toLowerCase();
    return templateTerms[type]?.some((term) => normalized.includes(term));
  });

  const selectedTemplateDays = () => Array.from(fields.dayList.querySelectorAll("input:checked"))
    .map((input) => input.value);

  const selectedManualDays = () => Array.from(fields.manualDayList.querySelectorAll("input:checked"))
    .map((input) => input.value);

  const updateDayList = (days, savedDays = []) => {
    fields.dayList.replaceChildren(...days.map(({ value, label }) => {
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
    const isTemplate = Object.hasOwn(templateTerms, fields.entryType.value);
    const isHoliday = fields.entryType.value === "publicHoliday";
    const showTemplateDays = isTemplate || isHoliday;
    const showManualDays = fields.entryType.value === "daily";
    manualOptions.style.display = showManualDays ? "block" : "none";
    templateOptions.style.display = showTemplateDays ? "block" : "none";
    fields.hours.value = isTemplate || isHoliday ? fields.defaultHours.value : fields.hours.value;
  };

  const loadPageOptions = (saved = {}) => {
    const works = workRows();
    const type = saved.entryType || fields.entryType.value || "daily";
    const templateWork = type === "publicHoliday"
      ? works.find(({ label }) => holidayTerms.some((term) => label.toLowerCase().includes(term)))
      : findTemplateWork(type, works);
    setOptions(fields.work, works.map(({ id, label }) => ({ value: id, label })), templateWork?.id || saved.work);
    const days = dayOptions();
    const savedManualDays = saved.manualDays?.length === days.length ? null : saved.manualDays;
    updateManualDayList(days, savedManualDays || weekdayDefaults(days));
    fields.entryType.value = type;
    fields.country.value = saved.country || "denmark";
    fields.defaultHours.value = saved.defaultHours || "7,4";
    fields.dayCount.value = saved.dayCount || (Object.hasOwn(templateTerms, type) || type === "publicHoliday" ? "1" : "");
    fields.hours.value = saved.hours || (Object.hasOwn(templateTerms, type) || type === "publicHoliday" ? fields.defaultHours.value : "");
    const defaultTemplateDays = weekdayDefaults(days).slice(0, Math.min(5, Number(fields.dayCount.value) || 1));
    updateDayList(days, saved.templateDays || defaultTemplateDays);
    updateMode();
    setStatus(`Ready: ${works.length} work item${works.length === 1 ? "" : "s"}, ${days.length} days.`);
  };

  chrome.storage.local.get(STORAGE_KEY, (result) => {
    const values = result[STORAGE_KEY] || {};
    loadPageOptions(values);
    if (fields.entryType.value === "publicHoliday") {
      loadHolidays();
    }
  });

  [fields.work, fields.dayCount, fields.hours, fields.country, fields.defaultHours].forEach((input) => input.addEventListener("change", saveDefaults));

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
    loadPageOptions({ work: fields.work.value, entryType: fields.entryType.value, dayCount: fields.dayCount.value, hours: fields.hours.value, manualDays: selectedManualDays(), templateDays: selectedTemplateDays() });
  };

  const loadHolidays = (force = false) => {
    const year = dayOptions()[0]?.date?.slice(0, 4);
    if (!year) {
      setStatus("No Planview dates found. Refresh the page and scan again.");
      return;
    }
    const cacheKey = `${fields.country.value}-${year}`;
    chrome.storage.local.get("planviewHolidayCache", (result) => {
      const cache = result.planviewHolidayCache || {};
      if (!force && cache[cacheKey]) {
        applyHolidays(cache[cacheKey].holidays, cache[cacheKey].url, true);
        return;
      }
      setStatus(`Loading ${fields.country.value} holidays for ${year}...`);
      chrome.runtime.sendMessage({ type: "loadHolidays", country: fields.country.value, year }, (response) => {
      if (chrome.runtime.lastError || response?.error) {
        setStatus(`Could not load holidays: ${response?.error || chrome.runtime.lastError.message}`);
        return;
      }
        cache[cacheKey] = { holidays: response.holidays || [], url: response.url, cachedAt: Date.now() };
        chrome.storage.local.set({ planviewHolidayCache: cache });
        applyHolidays(response.holidays || [], response.url, false);
      });
    });
  };

  const applyHolidays = (holidays, url, cached) => {
    const dates = new Set(dayOptions().map(({ date }) => date));
    loadedHolidays = holidays.filter(({ date }) => dates.has(date));
    const visibleDays = dayOptions().filter(({ date }) => loadedHolidays.some((holiday) => holiday.date === date));
    updateDayList(visibleDays, visibleDays.map(({ date }) => String(dayOptions().findIndex((day) => day.date === date))));
    setStatus(loadedHolidays.length ? `${cached ? "Using cached" : "Loaded"} ${loadedHolidays.length} public holiday${loadedHolidays.length === 1 ? "" : "s"}.` : "No holidays from the selected country are in this table.");
    if (fields.entryType.value === "publicHoliday" && loadedHolidays.length) {
      fill();
    }
  };

  const fill = () => {
    const selectedWork = workRows().find(({ id }) => id === fields.work.value);
    const value = fields.hours.value.trim();
    if (!selectedWork || !value) {
      setStatus("Choose a work item and enter hours first.");
      return;
    }
    if (Object.hasOwn(templateTerms, fields.entryType.value) || fields.entryType.value === "publicHoliday" || fields.entryType.value === "daily") {
      const days = fields.entryType.value === "daily" ? selectedManualDays() : selectedTemplateDays();
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

  fields.entryType.addEventListener("change", () => {
    const type = fields.entryType.value;
    const templateWork = type === "publicHoliday"
      ? workRows().find(({ label }) => holidayTerms.some((term) => label.toLowerCase().includes(term)))
      : findTemplateWork(type, workRows());
    if (templateWork) fields.work.value = templateWork.id;
    if (Object.hasOwn(templateTerms, type) || type === "publicHoliday") {
      fields.dayCount.value = "1";
      fields.hours.value = "7,4";
      updateDayList(dayOptions(), weekdayDefaults(dayOptions()).slice(0, 1));
    }
    updateMode();
    saveDefaults();
    if (type === "publicHoliday") {
      loadHolidays();
    }
  });
  fields.dayCount.addEventListener("input", () => {
    const count = Math.max(1, Math.min(5, Number(fields.dayCount.value) || 1));
    const days = dayOptions();
    const selected = selectedTemplateDays();
    const next = days.map(({ value }) => value).filter((value) => selected.includes(value)).slice(0, count);
    const additions = days.map(({ value }) => value).filter((value) => !next.includes(value)).slice(0, count - next.length);
    updateDayList(days, next.concat(additions));
    saveDefaults();
  });
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
        work: fields.work.value,
        entryType: fields.entryType.value,
        dayCount: fields.dayCount.value,
        hours: fields.hours.value,
        country: fields.country.value,
        defaultHours: fields.defaultHours.value,
        manualDays: selectedManualDays(),
        templateDays: selectedTemplateDays()
      };
      loadPageOptions(saved);
      if (fields.entryType.value === "publicHoliday") loadHolidays();
    }, 250);
  };
  const tableObserver = new MutationObserver(refreshForPlanviewNavigation);
  tableObserver.observe(document.querySelector("#timesheet") || document.body, { childList: true, subtree: true });
  window.addEventListener("popstate", refreshForPlanviewNavigation);
})();