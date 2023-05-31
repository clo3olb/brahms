function resetTeacherAttendanceSheet() {
  const teacherSpreadsheet = SpreadsheetApp.openById(TEACHER_SHEET_ID);
  const attendanceTable = getAttendanceTable(teacherSpreadsheet);

  const dbSpreadsheet = getDBSpreadsheet();
  const studentTable = getStudentTable(dbSpreadsheet);
  const students = studentTable.getAll();

  attendanceTable.resetSheet();

  // This is sorting students by their classroom in order of unicode. Please change this to be a custom classroom order.
  students.sort((studentA, studentB) =>
    studentA.classroom.localeCompare(studentB.classroom)
  );

  const attendenceList: Attendance[] = students.map((student) => ({
    name: student.name,
    classroom: student.classroom,
    attendance: "",
  }));

  attendanceTable.insertBatch(attendenceList);
}
