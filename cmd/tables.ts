function getDBSheet() {
  return SpreadsheetApp.openById(DB_SHEET_ID);
}

function getStudentTable(
  spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet
) {
  return new Table<Student>(spreadsheet, "학생", StudentDataType);
}

function getWordTestScoreTable(
  spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet
) {
  return new Table<WordTestScore>(
    spreadsheet,
    "단어시험 점수",
    WordTestScoreDataType
  );
}
