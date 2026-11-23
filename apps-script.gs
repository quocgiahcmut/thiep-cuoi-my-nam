// Dán vào Google Sheet: Tiện ích mở rộng > Apps Script, rồi Deploy > Web app
// (Execute as: Me, Who has access: Anyone). Copy URL dán vào CONFIG.rsvpEndpoint trong script.js
function doPost(e) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sh.getLastRow() === 0) sh.appendRow(["Thời gian", "Họ tên", "Tham dự", "Số người", "Lời chúc"]);
  const p = e.parameter;
  sh.appendRow([new Date(), p.name, p.attend, p.guests, p.wish]);
  return ContentService.createTextOutput("ok");
}
