function init() {
  const spreadsheet = SpreadsheetApp.openById(DB_SHEET_ID);

  const studentTable = getStudentTable(spreadsheet);
  const wordTestScoreTable = getWordTestScoreTable(spreadsheet);

  studentTable.createSheet(spreadsheet);
  wordTestScoreTable.createSheet(spreadsheet);
}
