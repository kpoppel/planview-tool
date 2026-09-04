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

  const url = `https://www.timeanddate.com/holidays/${country}/${year}`;
  fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error(`Holiday source returned ${response.status}.`);
      return response.text();
    })
    .then((html) => {
      const table = html.match(/<table[^>]+id=["']holidays-table["'][\s\S]*?<\/table>/i)?.[0] || html;
      const holidays = Array.from(table.matchAll(/<tr[\s\S]*?<time[^>]+datetime=["'](\d{4}-\d{2}-\d{2})["'][^>]*>[\s\S]*?<\/time>[\s\S]*?<\/tr>/gi))
        .map((match) => {
          const row = match[0].replace(/<script[\s\S]*?<\/script>/gi, "");
          const cells = Array.from(row.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi))
            .map((cell) => cell[1].replace(/<[^>]+>/g, " ").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim())
            .filter(Boolean);
          return { date: match[1], name: cells[2] || cells[1] };
        })
        .filter(({ name }) => name);
      sendResponse({ holidays, url });
    })
    .catch((error) => sendResponse({ error: error.message }));

  return true;
});