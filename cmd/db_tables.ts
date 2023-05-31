function getDBSpreadsheet() {
  return SpreadsheetApp.openById(DB_SHEET_ID);
}

function getStudentTable() {
  return new Table<Student>(getDBSpreadsheet(), "학생", StudentTableSchema);
}

function getWordTestScoreTable() {
  return new Table<WordTestScore>(
    getDBSpreadsheet(),
    "단어시험 점수",
    WordTestScoreTableSchema
  );
}

function getAttendanceTable() {
  return new Table<Attendance>(
    getDBSpreadsheet(),
    "출석",
    DBAttendanceTableSchema
  );
}
