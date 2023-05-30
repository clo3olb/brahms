function test() {
  const spreadsheet = getDBSheet();
  const studentTable = getStudentTable(spreadsheet);
  const wordTestScoreTable = getWordTestScoreTable(spreadsheet);

  const students = studentTable.getAll();
  const wordTestScores = wordTestScoreTable.getAll();
  Logger.log(students);
  Logger.log(wordTestScores);
}
