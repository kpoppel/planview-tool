"use strict";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "loadHolidays") {
    return false;
  }

  const country = message.country === "germany" ? "germany" : "denmark";
  const year = Number(message.year);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    sendResponse({ error: "The holiday year is invalid." });
    return false;
  }

  const countryCode = country === "germany" ? "DE" : "DK";
  const nagerUrl = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`;
  const cacheKey = `planviewHolidayCache:${country}:${year}`;
  const saveAndRespond = (holidays, url) => {
    chrome.storage.local.set({ [cacheKey]: { cachedAt: Date.now(), holidays, url } });
    sendResponse({ holidays, url });
  };
  const loadFromNetwork = () => fetch(nagerUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`Nager holiday API returned ${response.status}.`);
      return response.json();
    })
    .then((holidays) => {
      if (!Array.isArray(holidays)) throw new Error("Nager returned an invalid holiday response.");
      saveAndRespond(holidays.map(({ date, localName, name }) => ({ date, name: localName || name || "Public holiday" })), nagerUrl);
    });
  if (message.forceRefresh) {
    loadFromNetwork().catch((error) => sendResponse({ error: error.message }));
    return true;
  }
  chrome.storage.local.get(cacheKey, (result) => {
    const cached = result[cacheKey];
    if (cached && Array.isArray(cached.holidays)) {
      sendResponse({ holidays: cached.holidays, url: cached.url || nagerUrl, cachedAt: cached.cachedAt, cached: true });
      return;
    }
    loadFromNetwork().catch((error) => sendResponse({ error: error.message }));
  });

  return true;
});