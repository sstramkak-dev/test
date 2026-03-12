/**
 * Smart 5G Dashboard — Google Apps Script
 *
 * Target Spreadsheet ID: 1_Xx7sg1HMq_hOaAGvqCPjhoWiQU6TlOt7LXATyJWhMI
 *
 * Deploy as a Web App:
 *   1. Open https://script.google.com/
 *   2. Create a new project and paste this code.
 *   3. Click Deploy → New Deployment → Web App.
 *   4. Set "Execute as" = Me, "Who has access" = Anyone.
 *   5. Copy the deployment URL and paste it as GS_URL in app.js.
 *
 * Handles POST requests from the dashboard with payload:
 *   { sheet: "SheetName", action: "sync" | "delete", data: [...] | { id } }
 *
 * Sheets managed:
 *   Sales, Customers, TopUp, Terminations, Promotions, Deposits, Staff, KPI
 */

var SPREADSHEET_ID = '1_Xx7sg1HMq_hOaAGvqCPjhoWiQU6TlOt7LXATyJWhMI';

// Column definitions for each sheet (flat representation of nested data)
var SHEET_COLUMNS = {
  Sales: ['id', 'agent', 'branch', 'date', 'note', 'items', 'dollarItems'],
  Customers: ['id', 'name', 'phone', 'idNum', 'tariff', 'pkg', 'agent', 'branch', 'date', 'status', 'lat', 'lng'],
  TopUp: ['id', 'customerId', 'name', 'phone', 'tariff', 'agent', 'branch', 'date', 'tuStatus', 'amount', 'note'],
  Terminations: ['id', 'customerId', 'name', 'phone', 'reason', 'agent', 'branch', 'date'],
  Promotions: ['id', 'campaign', 'channel', 'startDate', 'endDate', 'terms'],
  Deposits: ['id', 'agent', 'branch', 'cash', 'credit', 'riel', 'amount', 'date', 'remark', 'status', 'approvedBy', 'approvedAt', 'cashDetail'],
  Staff: ['id', 'name', 'username', 'role', 'branch', 'status', 'email'],
  KPI: ['id', 'name', 'kpiType', 'kpiFor', 'assigneeId', 'assigneeBranch', 'target', 'valueMode', 'unit', 'currency', 'period']
};

/**
 * Entry point for POST requests from the dashboard.
 */
function doPost(e) {
  var result = { status: 'error', message: 'Unknown error' };
  try {
    var payload = JSON.parse(e.postData.contents);
    var sheetName = payload.sheet;
    var action    = payload.action;
    var data      = payload.data;

    if (!sheetName) throw new Error('Missing sheet name');

    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = getOrCreateSheet(ss, sheetName);

    if (action === 'sync') {
      syncSheetData(sheet, sheetName, data);
      result = { status: 'ok', message: 'Synced ' + sheetName };
    } else if (action === 'delete') {
      deleteRowById(sheet, data.id);
      result = { status: 'ok', message: 'Deleted from ' + sheetName };
    } else {
      throw new Error('Unknown action: ' + action);
    }
  } catch (err) {
    result = { status: 'error', message: err.message };
    Logger.log('Error: ' + err.message);
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * GET handler — returns a simple health-check response.
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', app: 'Smart 5G Dashboard Sync' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Returns an existing sheet by name, or creates it if it doesn't exist.
 */
function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

/**
 * Overwrites a sheet with the provided data array.
 * Column order follows SHEET_COLUMNS[sheetName]; unknown sheets use dynamic headers.
 */
function syncSheetData(sheet, sheetName, dataArray) {
  var headers = SHEET_COLUMNS[sheetName] || [];

  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    // Data is empty — clear the sheet and re-write the header row only
    sheet.clearContents();
    if (headers.length) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      formatHeaderRow(sheet, headers.length);
    }
    return;
  }
  // For unknown sheets, derive headers from first record's keys
  if (!headers.length) {
    headers = Object.keys(dataArray[0]);
  }

  var rows = dataArray.map(function(record) {
    return headers.map(function(col) {
      var val = record[col];
      if (val === undefined || val === null) return '';
      if (typeof val === 'object') return JSON.stringify(val);
      return val;
    });
  });

  sheet.clearContents();

  // Write header
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeaderRow(sheet, headers.length);

  // Write data rows
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
}

/**
 * Deletes the first row whose first-column value matches `id`.
 */
function deleteRowById(sheet, id) {
  var data = sheet.getDataRange().getValues();
  // data[0] is the header row; if there are no data rows, nothing to delete
  if (data.length <= 1) return;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);   // sheet rows are 1-indexed
      return;
    }
  }
}

/**
 * Applies a bold, green-background style to the header row.
 */
function formatHeaderRow(sheet, numCols) {
  var headerRange = sheet.getRange(1, 1, 1, numCols);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#1B7D3D');
  headerRange.setFontColor('#ffffff');
  headerRange.setHorizontalAlignment('center');
}
