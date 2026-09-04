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
    <p>Fill one existing work row. Review the page and submit it yourself.</p>
    <label for="pth-work">Work item</label>
    <select id="pth-work"></select>
    <label for="pth-entry-type">Entry type</label>
    <select id="pth-entry-type">
      <option value="daily">Daily</option>
      <option value="weekly">Weekly total</option>
      <option value="vacation">Vacation</option>
      <option value="absence">Absence</option>
      <option value="training">Training / conference</option>
      <option value="publicHoliday">Public holidays</option>
    </select>
    <div class="pth-manual-options">
      <label for="pth-date">Day</label>
      <select id="pth-date"></select>
    </div>
    <div class="pth-template-options">
      <label for="pth-country">Holiday country</label>
      <select id="pth-country">
        <option value="denmark">Denmark</option>
        <option value="germany">Germany</option>
      </select>
      <button class="pth-scan" id="pth-load-holidays" type="button">Load public holidays</button>
      <label for="pth-day-count">Number of days</label>
      <input id="pth-day-count" type="number" min="1" max="31" step="1" value="1">
      <label>Available days</label>
      <div id="pth-day-list" class="pth-day-list"></div>
    </div>
    <label for="pth-hours">Hours</label>
    <input id="pth-hours" type="text" inputmode="decimal" value="7,4" placeholder="e.g. 7,4 or 7:30">
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
    country: panel.querySelector("#pth-country"),
    dayCount: panel.querySelector("#pth-day-count"),
    dayList: panel.querySelector("#pth-day-list"),
    hours: panel.querySelector("#pth-hours")
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
      date: fields.date.value,
      dayCount: fields.dayCount.value,
      hours: fields.hours.value,
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

  const updateMode = () => {
    const isTemplate = Object.hasOwn(templateTerms, fields.entryType.value);
    const isHoliday = fields.entryType.value === "publicHoliday";
    manualOptions.style.display = isTemplate || isHoliday || fields.entryType.value === "weekly" ? "none" : "block";
    templateOptions.style.display = isTemplate || isHoliday ? "block" : "none";
    fields.date.disabled = fields.entryType.value === "weekly";
    fields.hours.value = isTemplate || isHoliday ? "7,4" : fields.hours.value;
  };

  const loadPageOptions = (saved = {}) => {
    const works = workRows();
    const type = saved.entryType || fields.entryType.value || "daily";
    const templateWork = type === "publicHoliday"
      ? works.find(({ label }) => holidayTerms.some((term) => label.toLowerCase().includes(term)))
      : findTemplateWork(type, works);
    setOptions(fields.work, works.map(({ id, label }) => ({ value: id, label })), templateWork?.id || saved.work);
    const days = dayOptions();
    setOptions(fields.date, days.map(({ value, label }) => ({ value, label })), saved.date || days[0]?.value);
    fields.entryType.value = type;
    fields.dayCount.value = saved.dayCount || (Object.hasOwn(templateTerms, type) ? "1" : "");
    fields.hours.value = saved.hours || (Object.hasOwn(templateTerms, type) ? "7,4" : "");
    updateDayList(days, saved.templateDays || days.slice(0, Number(fields.dayCount.value) || 1).map(({ value }) => value));
    updateMode();
    setStatus(`Ready: ${works.length} work item${works.length === 1 ? "" : "s"}, ${days.length} days.`);
  };

  chrome.storage.local.get(STORAGE_KEY, (result) => {
    const values = result[STORAGE_KEY] || {};
    loadPageOptions(values);
  });

  [fields.work, fields.date, fields.dayCount, fields.hours].forEach((input) => input.addEventListener("change", saveDefaults));

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
    loadPageOptions({ work: fields.work.value, entryType: fields.entryType.value, date: fields.date.value, dayCount: fields.dayCount.value, hours: fields.hours.value, templateDays: selectedTemplateDays() });
  };

  const loadHolidays = () => {
    const year = dayOptions()[0]?.date?.slice(0, 4);
    if (!year) {
      setStatus("No Planview dates found. Refresh the page and scan again.");
      return;
    }
    setStatus(`Loading ${fields.country.value} holidays for ${year}...`);
    chrome.runtime.sendMessage({ type: "loadHolidays", country: fields.country.value, year }, (response) => {
      if (chrome.runtime.lastError || response?.error) {
        setStatus(`Could not load holidays: ${response?.error || chrome.runtime.lastError.message}`);
        return;
      }
      const dates = new Set(dayOptions().map(({ date }) => date));
      loadedHolidays = (response.holidays || []).filter(({ date }) => dates.has(date));
      updateDayList(dayOptions().filter(({ date }) => loadedHolidays.some((holiday) => holiday.date === date)), loadedHolidays.map(({ date }) => String(dayOptions().findIndex((day) => day.date === date))));
      setStatus(loadedHolidays.length ? `Found ${loadedHolidays.length} holiday${loadedHolidays.length === 1 ? "" : "s"} in this Planview table.` : "No holidays from the selected country are in this table.");
    });
  };

  const fill = () => {
    const selectedWork = workRows().find(({ id }) => id === fields.work.value);
    const selectedDay = Number(fields.date.value);
    const value = fields.hours.value.trim();
    if (!selectedWork || !value) {
      setStatus("Choose a work item and enter hours first.");
      return;
    }
    if (Object.hasOwn(templateTerms, fields.entryType.value) || fields.entryType.value === "publicHoliday") {
      const days = selectedTemplateDays();
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
    const type = fields.entryType.value;
    const templateWork = type === "publicHoliday"
      ? workRows().find(({ label }) => holidayTerms.some((term) => label.toLowerCase().includes(term)))
      : findTemplateWork(type, workRows());
    if (templateWork) fields.work.value = templateWork.id;
    if (Object.hasOwn(templateTerms, type) || type === "publicHoliday") {
      fields.dayCount.value = "1";
      fields.hours.value = "7,4";
      updateDayList(dayOptions(), dayOptions().slice(0, 1).map(({ value }) => value));
    }
    updateMode();
    saveDefaults();
  });
  fields.dayCount.addEventListener("input", () => {
    const count = Math.max(1, Math.min(31, Number(fields.dayCount.value) || 1));
    const days = dayOptions();
    const selected = selectedTemplateDays();
    const next = days.map(({ value }) => value).filter((value) => selected.includes(value)).slice(0, count);
    const additions = days.map(({ value }) => value).filter((value) => !next.includes(value)).slice(0, count - next.length);
    updateDayList(days, next.concat(additions));
    saveDefaults();
  });
  panel.querySelector(".pth-scan").addEventListener("click", scan);
  panel.querySelector("#pth-load-holidays").addEventListener("click", loadHolidays);
  panel.querySelector(".pth-fill").addEventListener("click", fill);
})();