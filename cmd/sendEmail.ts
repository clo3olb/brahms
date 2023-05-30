function sendEmail() {
  const spreadsheet = SpreadsheetApp.openById(DB_SHEET_ID);
  const studentTable = getStudentTable(spreadsheet);

  const students = studentTable.getAll();
  for (let student of students) {
  }
}
