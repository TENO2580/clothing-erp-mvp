/**
 * Utility to export tabular data to CSV and trigger client-side download
 */
export function exportToCSV(filename, headers, rows) {
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((val) => {
          const str = String(val ?? "").replace(/"/g, '""');
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str}"`
            : str;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Utility to export entire ERP database as JSON backup
 */
export function exportToJSON(filename, data) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".json") ? filename : `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
