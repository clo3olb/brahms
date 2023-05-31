function sendEmail() {
  const spreadsheet = getDBSpreadsheet();
  const studentTable = getStudentTable(spreadsheet);

  const students = studentTable.getAll();
  for (let student of students) {
  }
}
