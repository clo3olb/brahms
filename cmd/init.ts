function init() {
  const studentTable = getStudentTable();
  const wordTestScoreTable = getWordTestScoreTable();

  studentTable.createSheet();
  wordTestScoreTable.createSheet();
}
