function getTeacherSpreadsheet() {
  return SpreadsheetApp.openById(TEACHER_SHEET_ID);
}

function getAttendanceTable(
  spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet
) {
  return new Table<Attendance>(spreadsheet, "출석", AttendanceTableSchema);
}
