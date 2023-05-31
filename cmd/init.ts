function init() {
  const spreadsheet = getDBSpreadsheet();

  const studentTable = getStudentTable(spreadsheet);
  const wordTestScoreTable = getWordTestScoreTable(spreadsheet);

  studentTable.createSheet();
  wordTestScoreTable.createSheet();
}
