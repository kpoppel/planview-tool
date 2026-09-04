(function () {
  "use strict";

  const STORAGE_KEY = "planviewTimeDefaults";
  const TEMPLATES_KEY = "planviewTimeTemplates";
  const HOLIDAY_SETTINGS_KEY = "planviewHolidaySettings";
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
    #${panelId} .pth-settings-content button { width: 100%; margin-top: 8px; }
    #${panelId} .pth-holiday-status { margin-top: 8px; color: #52606d; font-size: 12px; }
    #${panelId} .pth-adjustment { margin-top: 10px; padding-top: 10px; border-top: 1px solid #d3dbe1; }
    #${panelId} .pth-adjustment-table { width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 12px; }
    #${panelId} .pth-adjustment-table th, #${panelId} .pth-adjustment-table td { padding: 3px 4px; border-bottom: 1px solid #d3dbe1; text-align: left; }
    #${panelId} .pth-adjustment-table th:first-child, #${panelId} .pth-adjustment-table td:first-child { width: calc(100% - 72px); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    #${panelId} .pth-adjustment-table th:last-child, #${panelId} .pth-adjustment-table td:last-child { width: 64px; }
    #${panelId} .pth-adjustment-table input { width: 64px; padding: 4px; }
    #${panelId} .pth-adjustment-group td { padding-top: 8px; color: #52606d; font-size: 11px; font-weight: 700; letter-spacing: .02em; text-transform: uppercase; }
    #${panelId} .pth-adjustment-table tbody { display: block; max-height: 132px; overflow-y: auto; }
    #${panelId} .pth-adjustment-table thead, #${panelId} .pth-adjustment-table tbody tr { display: table; width: 100%; table-layout: fixed; }
    #${panelId} .pth-day-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px 8px; max-height: 120px; overflow: auto; padding: 6px 0; }
    #${panelId} .pth-day-list label { margin: 0; font-weight: 400; white-space: nowrap; }
    #${panelId} .pth-day-list input { width: auto; margin-right: 5px; }
    #${panelId} .pth-actions { display: flex; gap: 8px; margin-top: 14px; }
    #${panelId} button { flex: 1; padding: 8px 10px; border: 0; border-radius: 4px; cursor: pointer; font: 600 13px system-ui, sans-serif; }
    #${panelId} .pth-fill { background: #176b87; color: white; }
    #${panelId} .pth-scan { background: #dce5ea; color: #17202a; }
    #${panelId} .pth-danger { background: #b42318; color: white; }
    #${panelId} .pth-status { min-height: 18px; margin-top: 10px; color: #52606d; font-size: 12px; }
    #${panelId} .pth-template-actions { display: flex; gap: 8px; margin-top: 8px; }
    #${panelId} .pth-template-actions button { flex: 1; }
    #${panelId} .pth-modal { position: fixed; inset: 0; display: none; align-items: center; justify-content: center; background: rgba(23,32,42,.42); }
    #${panelId} .pth-modal[open] { display: flex; }
    #${panelId} .pth-dialog { box-sizing: border-box; width: min(560px, calc(100vw - 28px)); max-height: calc(100vh - 28px); overflow: auto; padding: 16px; background: #f8fafb; border: 1px solid #9aa7b2; border-radius: 8px; box-shadow: 0 10px 30px rgba(23,32,42,.28); }
    #${panelId} .pth-dialog h3 { margin: 0 0 12px; }
    #${panelId} .pth-template-table-wrap { max-height: min(52vh, 460px); overflow: auto; border: 1px solid #d3dbe1; }
    #${panelId} .pth-dialog table { width: 100%; border-collapse: collapse; font-size: 12px; }
    #${panelId} .pth-dialog th, #${panelId} .pth-dialog td { padding: 5px 4px; border-bottom: 1px solid #d3dbe1; text-align: left; }
    #${panelId} .pth-template-table-wrap thead th { position: sticky; top: 0; z-index: 1; background: #f8fafb; }
    #${panelId} .pth-dialog th:last-child, #${panelId} .pth-dialog td:last-child { width: 110px; }
    #${panelId} .pth-dialog .pth-template-group td { padding: 9px 4px 4px; border-bottom: 1px solid #9aa7b2; color: #52606d; font-size: 11px; font-weight: 700; letter-spacing: .02em; text-transform: uppercase; }
    #${panelId} .pth-dialog .pth-dialog-actions { display: flex; gap: 8px; margin-top: 14px; }
    #${panelId} .pth-dialog .pth-dialog-actions button { flex: 1; }
  `;
  document.documentElement.appendChild(styles);

  const panel = document.createElement("section");
  panel.id = panelId;
  panel.innerHTML = `
    <h2>Planview Time Helper</h2>
    <label for="pth-entry-type">Entry type</label>
    <select id="pth-entry-type">
    </select>
    <p class="pth-entry-help">Activities are grouped as they appear in Planview.</p>
    <div class="pth-template-actions">
      <button class="pth-scan" id="pth-new-template" type="button">New template</button>
      <button class="pth-scan" id="pth-edit-template" type="button">Edit selected</button>
      <button class="pth-danger" id="pth-delete-template" type="button">Delete selected</button>
    </div>
    <div class="pth-entry-mode">
      <div class="pth-mode" role="radiogroup" aria-label="Entry frequency">
        <label><input type="radio" name="pth-mode" value="daily" checked>Daily</label>
        <label><input type="radio" name="pth-mode" value="weekly">Weekly</label>
      </div>
    </div>
    <div class="pth-daily-options">
      <label>Days</label>
      <div id="pth-manual-day-list" class="pth-day-list"></div>
    </div>
    <div class="pth-hours-field">
      <label for="pth-hours">Hours</label>
      <input id="pth-hours" type="text" inputmode="decimal" value="7,4" placeholder="e.g. 7,4 or 7:30">
    </div>
    <div class="pth-adjustment">
      <label>Time adjustments (hours)</label>
      <table class="pth-adjustment-table"><thead><tr><th>Activity</th><th>Adjust</th></tr></thead><tbody id="pth-adjustment-rows"></tbody></table>
    </div>
    <div class="pth-actions">
      <button class="pth-fill" type="button">Fill</button>
      <button class="pth-scan" id="pth-clear" type="button">Clear</button>
    </div>
    <div class="pth-status" role="status"></div>
    <details class="pth-settings">
      <summary>Settings</summary>
      <div class="pth-settings-content">
        <label for="pth-default-template">Default template</label>
        <select id="pth-default-template"></select>
        <label for="pth-standard-hours">Standard working day hours</label>
        <input id="pth-standard-hours" type="text" inputmode="decimal" placeholder="e.g. 7,4 or 7:30">
        <label for="pth-holiday-country">Public holiday country</label>
        <select id="pth-holiday-country">
          <option value="denmark">Denmark</option>
          <option value="germany">Germany</option>
        </select>
        <button class="pth-scan" id="pth-load-holidays" type="button">Refresh public holidays</button>
        <div class="pth-holiday-status" id="pth-holiday-status" role="status"></div>
      </div>
    </details>
    <div class="pth-modal" id="pth-template-modal" role="dialog" aria-modal="true" aria-label="Template definition">
      <div class="pth-dialog">
        <h3>Custom template</h3>
        <label for="pth-template-name">Name</label>
        <input id="pth-template-name" type="text" maxlength="80" placeholder="e.g. Standard week">
        <div class="pth-mode" role="radiogroup" aria-label="Template frequency">
          <label><input type="radio" name="pth-template-mode" value="daily" checked>Daily</label>
          <label><input type="radio" name="pth-template-mode" value="weekly">Weekly</label>
        </div>
        <p id="pth-template-help">Enter hours for each activity and weekday. Group headings match the Planview table.</p>
        <div class="pth-template-table-wrap">
          <table><thead><tr id="pth-template-header"></tr></thead><tbody id="pth-template-rows"></tbody></table>
        </div>
        <div class="pth-dialog-actions">
          <button class="pth-scan" id="pth-template-cancel" type="button">Cancel</button>
          <button class="pth-fill" id="pth-template-save" type="button">Save template</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  const fields = {
    activity: panel.querySelector("#pth-entry-type"),
    manualDayList: panel.querySelector("#pth-manual-day-list"),
    hours: panel.querySelector("#pth-hours"),
    adjustmentRows: panel.querySelector("#pth-adjustment-rows")
  };
  const defaultTemplate = panel.querySelector("#pth-default-template");
  const standardHours = panel.querySelector("#pth-standard-hours");
  const holidayCountry = panel.querySelector("#pth-holiday-country");
  const holidayStatus = panel.querySelector("#pth-holiday-status");
  const templateModal = panel.querySelector("#pth-template-modal");
  const templateHeader = panel.querySelector("#pth-template-header");
  const templateRows = panel.querySelector("#pth-template-rows");
  let editingTemplateId = "";
  const dailyOptions = panel.querySelector(".pth-daily-options");
  const entryMode = panel.querySelector(".pth-entry-mode");
  const hoursField = panel.querySelector(".pth-hours-field");
  const modeInputs = Array.from(panel.querySelectorAll("input[name='pth-mode']"));
  const status = panel.querySelector(".pth-status");
  let loadedHolidays = [];
  let loadedHolidayYear = "";
  let loadedHolidayCountry = "";

  const setStatus = (message) => {
    status.textContent = message;
  };

  const readTemplates = () => {
    try { return JSON.parse(window.localStorage.getItem(TEMPLATES_KEY) || "[]"); } catch (error) { return []; }
  };

  const writeTemplates = (templates) => window.localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));

  const readHolidaySettings = () => {
    try { return JSON.parse(window.localStorage.getItem(HOLIDAY_SETTINGS_KEY) || "{}"); } catch (error) { return {}; }
  };

  const saveHolidaySettings = () => {
    window.localStorage.setItem(HOLIDAY_SETTINGS_KEY, JSON.stringify({
      standardHours: standardHours.value,
      country: holidayCountry.value
    }));
  };

  const setHolidayStatus = (message) => {
    holidayStatus.textContent = message;
  };

  const templateIsValid = (template, works) => {
    const currentIds = works.map(({ id }) => id).sort();
    return Array.isArray(template.activityIds) && JSON.stringify(currentIds) === JSON.stringify([...template.activityIds].sort());
  };

  const selectedTemplateId = () => fields.activity.selectedOptions[0]?.dataset.templateId || "";

  const clampAdjustmentInput = (input) => {
    const value = parseHours(input.value);
    const minimum = Number(input.min);
    if (value !== null && Number.isFinite(minimum) && value < minimum) input.value = String(Number(minimum.toFixed(2)));
  };

  const updateAdjustmentOptions = (works, savedAdjustments = {}) => {
    const template = readTemplates().find((item) => item.id === selectedTemplateId());
    const days = dayOptions();
    const holidayIndexes = new Set(holidayDays().map(({ value }) => Number(value)));
    const visibleWeekdays = new Set(days.filter(({ weekday }) => weekday >= 1 && weekday <= 5).map(({ weekday }) => weekday));
    const workingDayCount = new Set(days
      .filter(({ weekday, value }) => weekday >= 1 && weekday <= 5 && !holidayIndexes.has(Number(value)))
      .map(({ weekday }) => weekday)).size || Math.max(visibleWeekdays.size - holidayIndexes.size, 0);
    const entries = new Map(Array.isArray(template?.entries) ? template.entries.map((entry) => [entry.id, entry.hours]) : []);
    const rows = [];
    let currentGroup = "";
    works.forEach(({ id, label, group }) => {
      if (group !== currentGroup) {
        currentGroup = group;
        const groupRow = document.createElement("tr");
        groupRow.className = "pth-adjustment-group";
        const groupCell = document.createElement("td");
        groupCell.colSpan = 2;
        groupCell.textContent = group;
        groupRow.append(groupCell);
        rows.push(groupRow);
      }
      const row = document.createElement("tr");
      const labelCell = document.createElement("td");
      labelCell.textContent = label;
      labelCell.title = label;
      const inputCell = document.createElement("td");
      const input = document.createElement("input");
      input.type = "number";
      input.inputMode = "decimal";
      input.step = "0.5";
      input.placeholder = "0";
      input.dataset.activityId = id;
      const savedValue = savedAdjustments[id];
      const parsedSavedValue = savedValue === undefined || savedValue === "" ? null : parseHours(savedValue);
      input.value = parsedSavedValue === null ? "" : String(parsedSavedValue);
      const entry = entries.get(id);
      const availableHours = template?.mode === "daily"
        ? days.filter(({ weekday, value }) => weekday >= 1 && weekday <= 5 && !holidayIndexes.has(Number(value)))
          .reduce((total, day) => {
            const hours = parseHours(entry?.[String(day.weekday)] || "0") || 0;
            return total + Math.floor(Math.max(hours, 0) * 2) / 2;
          }, 0)
        : (() => {
          const hours = parseHours(scaleWeeklyHours(entry || "0", workingDayCount)) || 0;
          return Math.floor(Math.max(hours, 0) * 2) / 2;
        })();
      input.min = String(Number((-availableHours).toFixed(2)));
      clampAdjustmentInput(input);
      input.addEventListener("change", saveDefaults);
      input.addEventListener("input", () => { clampAdjustmentInput(input); saveDefaults(); });
      input.addEventListener("wheel", (event) => event.stopPropagation());
      inputCell.append(input);
      row.append(labelCell, inputCell);
      rows.push(row);
    });
    fields.adjustmentRows.replaceChildren(...rows);
  };

  const templateWeekdays = [
    { value: "1", label: "Monday" },
    { value: "2", label: "Tuesday" },
    { value: "3", label: "Wednesday" },
    { value: "4", label: "Thursday" },
    { value: "5", label: "Friday" }
  ];

  const saveDefaults = () => {
    const values = {
      work: fields.activity.value,
      mode: selectedMode(),
      hours: fields.hours.value,
      manualDays: selectedManualDays(),
      adjustments: Object.fromEntries(Array.from(fields.adjustmentRows.querySelectorAll("input"))
        .filter((input) => input.value.trim())
        .map((input) => [input.dataset.activityId, input.value.trim()]))
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

  const updateTemplateOptions = (works, selectedValue = "") => {
    const templates = readTemplates();
    const options = [];
    const groups = new Map();
    works.forEach((work) => {
      const group = work.group || "Other activities";
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(work);
    });
    groups.forEach((groupWorks, groupLabel) => {
      const optgroup = document.createElement("optgroup");
      optgroup.label = groupLabel;
      groupWorks.forEach(({ id, label }) => optgroup.append(new Option(label, id)));
      options.push(optgroup);
    });
    const templateGroup = document.createElement("optgroup");
    templateGroup.label = "Templates";
    templates.forEach((template) => {
      const valid = templateIsValid(template, works);
      const option = new Option(`${template.name}${valid ? "" : " (needs update)"}`, `template:${template.id}`);
      option.dataset.templateId = template.id;
      templateGroup.append(option);
    });
    if (templates.length) options.push(templateGroup);
    fields.activity.replaceChildren(...options);
    const allOptions = Array.from(fields.activity.options);
    fields.activity.value = selectedValue && allOptions.some((option) => option.value === selectedValue)
      ? selectedValue : (works[0]?.id || "");
    updateAdjustmentOptions(works);
    defaultTemplate.replaceChildren(new Option("No default", ""), ...templates.map((template) => new Option(template.name, template.id)));
  };

  const workRows = () => {
    let group = "Other activities";
    return Array.from(document.querySelectorAll("#timesheet tbody > tr"))
      .flatMap((row) => {
        if (row.classList.contains("projRow")) {
          group = row.querySelector(".descrCol")?.textContent.replace(/\s+/g, " ").trim() || "Other activities";
          return [];
        }
        if (!row.classList.contains("workRow")) return [];
        const item = {
          row,
          group,
          id: row.querySelector("input[id$='###weekly']")?.id.split("###")[0],
          label: row.querySelector(".descrCol span[title]")?.textContent.trim() || row.querySelector(".descrCol")?.textContent.trim()
        };
        return item.id && item.label ? [item] : [];
      });
  };

  const dayOptions = () => Array.from(document.querySelectorAll("#timesheet thead th.dailyCol time"))
    .map((time, index) => {
      const date = time.dateTime;
      const weekday = date ? new Date(`${date}T00:00:00Z`).getUTCDay() : 0;
      return { value: String(index), label: time.textContent.trim(), date, weekday };
    });

  const holidayTerms = ["public holiday", "public holidays"];

  const findHolidayWork = (works) => works.find(({ label }) => {
    const normalized = label.toLowerCase();
    return holidayTerms.some((term) => normalized.includes(term));
  });

  const holidayDays = () => {
    const dates = new Set(loadedHolidays.map(({ date }) => date));
    return dayOptions().filter(({ date }) => dates.has(date));
  };

  const loadHolidays = (forceRefresh = false) => {
    const year = dayOptions()[0]?.date?.slice(0, 4);
    if (!year) {
      setHolidayStatus("No Planview dates found. Refresh the page and try again.");
      return;
    }
    setHolidayStatus(`Loading ${holidayCountry.value} holidays for ${year}...`);
    chrome.runtime.sendMessage({ type: "loadHolidays", country: holidayCountry.value, year, forceRefresh }, (response) => {
      if (chrome.runtime.lastError || response?.error) {
        setHolidayStatus(`Could not load holidays: ${response?.error || chrome.runtime.lastError?.message || "unknown error"}`);
        return;
      }
      const dates = new Set(dayOptions().map(({ date }) => date));
      loadedHolidays = (response.holidays || []).filter(({ date }) => dates.has(date));
      loadedHolidayYear = year;
      loadedHolidayCountry = holidayCountry.value;
      const adjustments = Object.fromEntries(Array.from(fields.adjustmentRows.querySelectorAll("input"))
        .map((input) => [input.dataset.activityId, input.value]));
      updateAdjustmentOptions(workRows(), adjustments);
      setHolidayStatus(loadedHolidays.length
        ? `Found ${loadedHolidays.length} holiday${loadedHolidays.length === 1 ? "" : "s"} in this Planview table${response.cached ? " (cached)" : ""}.`
        : "No public holidays from the selected country are in this table.");
    });
  };

  const weekdayDefaults = (days) => days.filter(({ date }) => {
    const day = new Date(`${date}T00:00:00Z`).getUTCDay();
    return day >= 1 && day <= 5;
  }).map(({ value }) => value);

  const selectedManualDays = () => Array.from(fields.manualDayList.querySelectorAll("input:checked"))
    .map((input) => input.value);

  const selectedMode = () => panel.querySelector("input[name='pth-mode']:checked").value;

  const scaleWeeklyHours = (value, visibleWeekdays) => {
    if (visibleWeekdays >= 5) return value;
    const text = String(value).trim();
    const clockMatch = text.match(/^(\d+)\s*:\s*(\d{1,2})$/);
    if (clockMatch) {
      const totalMinutes = (Number(clockMatch[1]) * 60 + Number(clockMatch[2])) * visibleWeekdays / 5;
      const roundedMinutes = Math.round(totalMinutes);
      return `${Math.floor(roundedMinutes / 60)}:${String(roundedMinutes % 60).padStart(2, "0")}`;
    }
    const numericValue = Number(text.replace(",", "."));
    if (!Number.isFinite(numericValue)) return value;
    const scaledValue = numericValue * visibleWeekdays / 5;
    return String(Number(scaledValue.toFixed(2))).replace(".", text.includes(",") ? "," : ".");
  };

  const multiplyHours = (value, multiplier) => {
    if (multiplier === 1) return value;
    const text = String(value).trim();
    const clockMatch = text.match(/^(\d+)\s*:\s*(\d{1,2})$/);
    if (clockMatch) {
      const totalMinutes = (Number(clockMatch[1]) * 60 + Number(clockMatch[2])) * multiplier;
      const roundedMinutes = Math.round(totalMinutes);
      return `${Math.floor(roundedMinutes / 60)}:${String(roundedMinutes % 60).padStart(2, "0")}`;
    }
    const numericValue = Number(text.replace(",", "."));
    if (!Number.isFinite(numericValue)) return value;
    const multipliedValue = Number((numericValue * multiplier).toFixed(2));
    return String(multipliedValue).replace(".", text.includes(",") ? "," : ".");
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
    const isTemplate = Boolean(selectedTemplateId());
    entryMode.style.display = isTemplate ? "none" : "block";
    dailyOptions.style.display = isTemplate || selectedMode() !== "daily" ? "none" : "block";
    hoursField.style.display = isTemplate ? "none" : "block";
    panel.querySelector(".pth-adjustment").style.display = isTemplate ? "block" : "none";
  };

  const loadPageOptions = (saved = {}) => {
    const holidaySettings = readHolidaySettings();
    standardHours.value = holidaySettings.standardHours || "7,4";
    holidayCountry.value = holidaySettings.country === "germany" ? "germany" : "denmark";
    const works = workRows();
    updateTemplateOptions(works, saved.work || fields.activity.value);
    const days = dayOptions();
    const savedManualDays = saved.manualDays?.length === days.length ? null : saved.manualDays;
    updateManualDayList(days, savedManualDays || weekdayDefaults(days));
    modeInputs.forEach((input) => { input.checked = input.value === (saved.mode || "daily"); });
    fields.hours.value = saved.hours || "";
    const storedDefault = saved.defaultTemplate || window.localStorage.getItem(`${TEMPLATES_KEY}:default`) || "";
    defaultTemplate.value = storedDefault;
    if (storedDefault && !saved.work) {
      const defaultOption = Array.from(fields.activity.options).find((option) => option.dataset.templateId === storedDefault);
      if (defaultOption) fields.activity.value = defaultOption.value;
    }
    updateAdjustmentOptions(works, saved.adjustments || {});
    updateMode();
    setStatus(`Ready: ${works.length} work item${works.length === 1 ? "" : "s"}, ${days.length} days.`);
    if (loadedHolidayYear !== days[0]?.date?.slice(0, 4) || loadedHolidayCountry !== holidayCountry.value) loadHolidays();
  };

  const renderTemplateRows = (template = null) => {
    const mode = panel.querySelector("input[name='pth-template-mode']:checked").value;
    const entries = new Map(Array.isArray(template?.entries) ? template.entries.map((entry) => [entry.id, entry.hours]) : []);
    const headers = ["Activity", ...(mode === "daily" ? templateWeekdays.map(({ label }) => label) : ["Hours"])];
    templateHeader.replaceChildren(...headers.map((label) => {
      const cell = document.createElement("th");
      cell.textContent = label;
      return cell;
    }));
    const rows = [];
    let currentGroup = "";
    workRows().forEach(({ id, label, group }) => {
      if (group !== currentGroup) {
        currentGroup = group;
        const groupRow = document.createElement("tr");
        groupRow.className = "pth-template-group";
        const groupCell = document.createElement("td");
        groupCell.colSpan = mode === "daily" ? 6 : 2;
        groupCell.textContent = group;
        groupRow.append(groupCell);
        rows.push(groupRow);
      }
      const row = document.createElement("tr");
      row.dataset.activityId = id;
      const labelCell = document.createElement("td");
      labelCell.textContent = label;
      row.append(labelCell);
      if (mode === "daily") {
        const dailyHours = entries.get(id) && typeof entries.get(id) === "object" ? entries.get(id) : {};
        templateWeekdays.forEach(({ value }) => {
          const inputCell = document.createElement("td");
          const input = document.createElement("input");
          input.type = "text";
          input.inputMode = "decimal";
          input.placeholder = "0";
          input.value = dailyHours[value] || "";
          input.dataset.weekday = value;
          inputCell.append(input);
          row.append(inputCell);
        });
      } else {
        const inputCell = document.createElement("td");
        const input = document.createElement("input");
        input.type = "text";
        input.inputMode = "decimal";
        input.placeholder = "0";
        input.value = typeof entries.get(id) === "string" ? entries.get(id) : "";
        inputCell.append(input);
        row.append(inputCell);
      }
      rows.push(row);
    });
    templateRows.replaceChildren(...rows);
  };

  const openTemplateEditor = (template = null) => {
    editingTemplateId = template?.id || "";
    panel.querySelector("#pth-template-name").value = template?.name || "";
    panel.querySelectorAll("input[name='pth-template-mode']").forEach((input) => { input.checked = input.value === (template?.mode || "daily"); });
    renderTemplateRows(template);
    templateModal.setAttribute("open", "");
    panel.querySelector("#pth-template-name").focus();
  };

  const saveTemplate = () => {
    const name = panel.querySelector("#pth-template-name").value.trim();
    const works = workRows();
    if (!name || !works.length) { setStatus("Add a name and make sure activities are available first."); return; }
    const templateMode = panel.querySelector("input[name='pth-template-mode']:checked").value;
    const template = {
      id: `template-${Date.now()}`,
      name,
      mode: templateMode,
      activityIds: works.map(({ id }) => id),
      entries: Array.from(templateRows.querySelectorAll("tr")).map((row) => ({
        id: row.dataset.activityId,
        hours: templateMode === "daily"
          ? Object.fromEntries(Array.from(row.querySelectorAll("input")).map((input) => [input.dataset.weekday, input.value.trim()]))
          : row.querySelector("input").value.trim()
      }))
    };
    const templates = readTemplates();
    const existingIndex = templates.findIndex((item) => item.id === editingTemplateId);
    if (existingIndex >= 0) templates[existingIndex] = { ...template, id: editingTemplateId };
    else templates.push(template);
    writeTemplates(templates);
    templateModal.removeAttribute("open");
    panel.querySelector("#pth-template-name").value = "";
    editingTemplateId = "";
    const savedId = existingIndex >= 0 ? templates[existingIndex].id : template.id;
    loadPageOptions({ work: `template:${savedId}`, mode: template.mode, hours: fields.hours.value, manualDays: selectedManualDays() });
    setStatus(`${existingIndex >= 0 ? "Updated" : "Saved"} template “${name}”.`);
  };

  chrome.storage.local.get(STORAGE_KEY, (result) => {
    const values = result[STORAGE_KEY] || {};
    loadPageOptions(values);
  });

  fields.activity.addEventListener("change", () => {
    updateAdjustmentOptions(workRows(), {});
    updateMode();
    saveDefaults();
  });
  fields.hours.addEventListener("change", saveDefaults);
  defaultTemplate.addEventListener("change", () => {
    window.localStorage.setItem(`${TEMPLATES_KEY}:default`, defaultTemplate.value);
    setStatus(defaultTemplate.value ? "Default template saved." : "Default template cleared.");
  });
  standardHours.addEventListener("change", saveHolidaySettings);
  holidayCountry.addEventListener("change", () => {
    loadedHolidays = [];
    loadedHolidayYear = "";
    loadedHolidayCountry = "";
    saveHolidaySettings();
    loadHolidays();
  });
  panel.querySelector("#pth-load-holidays").addEventListener("click", () => loadHolidays(true));
  panel.querySelector("#pth-new-template").addEventListener("click", openTemplateEditor);
  panel.querySelector("#pth-edit-template").addEventListener("click", () => {
    const template = readTemplates().find((item) => item.id === selectedTemplateId());
    if (template) openTemplateEditor(template);
    else setStatus("Select a custom template first.");
  });
  panel.querySelector("#pth-delete-template").addEventListener("click", () => {
    const templateId = selectedTemplateId();
    const template = readTemplates().find((item) => item.id === templateId);
    if (!template) {
      setStatus("Select a custom template first.");
      return;
    }
    if (!window.confirm(`Delete template “${template.name}”?`)) return;
    writeTemplates(readTemplates().filter((item) => item.id !== templateId));
    loadPageOptions({ work: "", mode: selectedMode(), hours: fields.hours.value, manualDays: selectedManualDays() });
    setStatus(`Deleted template “${template.name}”.`);
  });
  panel.querySelector("#pth-template-cancel").addEventListener("click", () => { editingTemplateId = ""; templateModal.removeAttribute("open"); });
  panel.querySelector("#pth-template-save").addEventListener("click", saveTemplate);
  panel.querySelectorAll("input[name='pth-template-mode']").forEach((input) => input.addEventListener("change", () => renderTemplateRows()));
  modeInputs.forEach((input) => input.addEventListener("change", () => { updateMode(); saveDefaults(); }));

  const normalizeHours = (value) => {
    const text = String(value).trim();
    return /^\d+\.\d+$/.test(text) ? text.replace(".", ",") : text;
  };

  const setNativeValue = (element, value) => {
    const prototype = Object.getPrototypeOf(element);
    const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
    const normalizedValue = normalizeHours(value);
    if (descriptor && descriptor.set) {
      descriptor.set.call(element, normalizedValue);
    } else {
      element.value = normalizedValue;
    }
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const parseHours = (value) => {
    const text = String(value ?? "").trim();
    const clockMatch = text.match(/^(\d+)\s*:\s*(\d{1,2})$/);
    if (clockMatch) return Number(clockMatch[1]) + Number(clockMatch[2]) / 60;
    const numericValue = Number(text.replace(",", "."));
    return Number.isFinite(numericValue) ? numericValue : null;
  };

  const formatHours = (value) => String(Number(value.toFixed(2))).replace(".", ",");

  const distributeDailyAdjustment = (days, holidayIndexes, dailyHours, adjustment) => {
    const available = days
      .filter(({ weekday, value }) => weekday >= 1 && weekday <= 5 && !holidayIndexes.has(Number(value)))
      .map((day) => ({
        ...day,
        hours: parseHours(dailyHours[String(day.weekday)] || "0")
      }));
    if (available.some(({ hours }) => hours === null)) return null;
    let remainingSteps = Math.round(adjustment * 2);
    let cursor = 0;
    while (remainingSteps) {
      let changed = false;
      for (let checked = 0; checked < available.length && remainingSteps; checked += 1) {
        const item = available[cursor % available.length];
        cursor += 1;
        if (remainingSteps < 0 && item.hours < 0.5) continue;
        item.hours += remainingSteps > 0 ? 0.5 : -0.5;
        remainingSteps += remainingSteps > 0 ? -1 : 1;
        changed = true;
      }
      if (!changed) return null;
    }
    return new Map(available.map(({ value, hours }) => [value, formatHours(hours)]));
  };

  const fill = () => {
    const templateId = selectedTemplateId();
    if (templateId) {
      const template = readTemplates().find((item) => item.id === templateId);
      const works = workRows();
      if (!template || !templateIsValid(template, works)) {
        setStatus("This template is out of date because the available activities changed. Update it before filling.");
        return;
      }
      modeInputs.forEach((input) => { input.checked = input.value === template.mode; });
      updateMode();
      const entries = new Map(Array.isArray(template.entries) ? template.entries.map((entry) => [entry.id, entry.hours]) : []);
      const days = dayOptions();
      const holidays = holidayDays();
      const holidayIndexes = new Set(holidays.map(({ value }) => Number(value)));
      const renderedWeekdays = new Set(days.filter(({ weekday }) => weekday >= 1 && weekday <= 5).map(({ weekday }) => weekday));
      const workingWeekdays = new Set(days
        .filter(({ weekday, value }) => weekday >= 1 && weekday <= 5 && !holidayIndexes.has(Number(value)))
        .map(({ weekday }) => weekday));
      const visibleWeekdays = renderedWeekdays.size || 5;
      const workingDayCount = workingWeekdays.size || Math.max(visibleWeekdays - holidays.length, 0);
      const holidayWork = findHolidayWork(works);
      fields.adjustmentRows.querySelectorAll("input").forEach(clampAdjustmentInput);
      const adjustments = Object.fromEntries(Array.from(fields.adjustmentRows.querySelectorAll("input"))
        .filter((input) => input.value.trim())
        .map((input) => [input.dataset.activityId, parseHours(input.value)]));
      if (Object.values(adjustments).some((adjustment) => adjustment === null || !Number.isInteger(adjustment * 2))) {
        setStatus("Time adjustments must be entered in 0.5-hour increments.");
        return;
      }
      const dailyAdjustmentValues = new Map();
      for (const [activityId, adjustment] of Object.entries(adjustments)) {
        if (!adjustment) continue;
        const entry = entries.get(activityId);
        const values = distributeDailyAdjustment(days, holidayIndexes, typeof entry === "object" ? entry : {}, adjustment);
        if (!values) {
          setStatus("An adjustment cannot be distributed without creating negative time.");
          return;
        }
        dailyAdjustmentValues.set(activityId, values);
      }
      let filled = 0;
      works.forEach((work) => {
        const value = entries.get(work.id);
        if (!value && !Object.hasOwn(adjustments, work.id)) return;
        if (template.mode === "daily") {
          days.forEach((day) => {
            if (holidayIndexes.has(Number(day.value))) return;
            const dailyHours = typeof value === "object" ? value : {};
            const adjustedValues = dailyAdjustmentValues.get(work.id);
            const hours = adjustedValues?.has(day.value)
              ? adjustedValues.get(day.value)
              : dailyHours[String(day.weekday)];
            const target = work.row.querySelectorAll("td.dailyCol input")[Number(day.value)];
            if (hours && target) { setNativeValue(target, hours); filled += 1; }
          });
        } else {
          const target = work.row.querySelector("input[id$='###weekly']");
          if (target) {
            let hours = scaleWeeklyHours(value || "0", workingDayCount);
            const adjustment = adjustments[work.id] || 0;
            if (adjustment) {
              const numericHours = parseHours(hours);
              if (numericHours === null) {
                setStatus("The selected activity has an invalid template value.");
                return;
              }
              if (numericHours + adjustment < 0) {
                setStatus("The adjustment cannot create negative time for the selected activity.");
                return;
              }
              hours = formatHours(numericHours + adjustment);
            }
            setNativeValue(target, hours);
            filled += 1;
          }
        }
      });
      if (holidayWork && holidays.length && standardHours.value.trim()) {
        if (template.mode === "daily") {
          holidays.forEach((day) => {
            const target = holidayWork.row.querySelectorAll("td.dailyCol input")[Number(day.value)];
            if (target) { setNativeValue(target, standardHours.value); filled += 1; }
          });
        } else {
          const target = holidayWork.row.querySelector("input[id$='###weekly']");
          if (target) { setNativeValue(target, multiplyHours(standardHours.value, holidays.length)); filled += 1; }
        }
      }
      saveDefaults();
      const scaleMessage = template.mode === "weekly" && (workingDayCount < 5 || holidays.length)
        ? ` (${workingDayCount}/5 working weekdays${holidays.length ? `, ${holidays.length} holiday${holidays.length === 1 ? "" : "s"}` : ""})`
        : "";
      setStatus(`Filled ${filled} template entr${filled === 1 ? "y" : "ies"}${scaleMessage}. Review before submitting.`);
      return;
    }
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

  panel.querySelector("#pth-clear").addEventListener("click", clearForm);
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
        manualDays: selectedManualDays(),
        adjustments: Object.fromEntries(Array.from(fields.adjustmentRows.querySelectorAll("input"))
          .filter((input) => input.value.trim())
          .map((input) => [input.dataset.activityId, input.value.trim()]))
      };
      loadPageOptions(saved);
    }, 250);
  };
  const tableObserver = new MutationObserver(refreshForPlanviewNavigation);
  tableObserver.observe(document.querySelector("#timesheet") || document.body, { childList: true, subtree: true });
  window.addEventListener("popstate", refreshForPlanviewNavigation);
})();
