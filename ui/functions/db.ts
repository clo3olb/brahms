function updateStudentEssentials(table: Table, student: Student) {
  table.setValue(student.name, "ID", student.id);
  table.setValue(student.name, "유형", student.category);
  table.setValue(student.name, "반", student.classroom);
  table.setValue(student.name, "성별", student.gender);
  table.setValue(student.name, "학년", student.grade);
}

function syncDBWithStudentInfo(
  dbSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet
) {
  const students = getStudents(dbSpreadsheet);

  const wordTestTable = getDBWordTestTable(dbSpreadsheet);

  const attendanceTable = getDBAttendanceTable(dbSpreadsheet);

  const wordTestStudentNames = wordTestTable.getIds();
  const attendanceStudentNames = attendanceTable.getIds();

  for (const student of students) {
    if (!wordTestStudentNames.includes(student.name)) {
      wordTestTable.addId(student.name);
    }
    if (!attendanceStudentNames.includes(student.name)) {
      attendanceTable.addId(student.name);
    }

    updateStudentEssentials(wordTestTable, student);
    updateStudentEssentials(attendanceTable, student);
  }

  wordTestTable.paint();
  attendanceTable.paint();
}

// 정렬 및 서식 적용
function styleDB(dbSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet) {
  const studentTable = getDBStudentTable(dbSpreadsheet);

  const wordTestTable = getDBWordTestTable(dbSpreadsheet);

  const attendanceTable = getDBAttendanceTable(dbSpreadsheet);

  basicSort(studentTable);
  basicColor(studentTable);
  basicSort(attendanceTable);
  basicColor(attendanceTable);
  basicSort(wordTestTable);
  basicColor(wordTestTable);
}
