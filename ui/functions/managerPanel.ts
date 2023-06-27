function recoverManagerPanelFromDB(
  dbSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
  managerPanelSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
  managerPanelSchema: ClassManagementPanelSchema[]
) {
  const metadataTable = getManagerPanelMetadataTable(managerPanelSpreadsheet);
  const dateStr = metadataTable.getValue("날짜", "값");

  const wordTestTable = getDBWordTestTable(dbSpreadsheet);
  const attendanceTable = getDBAttendanceTable(dbSpreadsheet);

  for (const schema of managerPanelSchema) {
    const sheetName = `${schema.category} ${schema.classroom}`;
    const sheet = managerPanelSpreadsheet.getSheetByName(sheetName);
    const table = new Table(sheet, "이름", 1);
    const studentNames = table.getIds();

    for (const name of studentNames) {
      // Word Test Scores
      const score = wordTestTable.getValue(name, `${dateStr}(정)`);
      table.setValue(name, "단어시험", score);

      const retestScore = wordTestTable.getValue(name, `${dateStr}(재)`);
      table.setValue(name, "재시험", retestScore);

      // Attendances
      for (const timeslot of schema.timeslots) {
        const header = createAttendanceHeader(dateStr, timeslot);
        const attendance = attendanceTable.getValue(name, header);
        table.setValue(name, timeslot, attendance);
      }
      table.paint();
    }
  }
}

function resetManagerPanel(
  dbSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
  managerPanelSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
  managerPanelSchema: ClassManagementPanelSchema[]
) {
  const students = getStudents(dbSpreadsheet);

  for (const schema of managerPanelSchema) {
    const sheetName = `${schema.category} ${schema.classroom}`;
    const sheet = managerPanelSpreadsheet.getSheetByName(sheetName);
    let filteredStudents: Student[] = [];
    if (schema.category == "Math") {
      filteredStudents = students.filter(
        (student) => student.math == schema.classroom
      );
    } else if (schema.category == "TOEFL") {
      filteredStudents = students.filter(
        (student) =>
          student.category == "TOEFL" && student.classroom == schema.classroom
      );
    } else if (schema.category == "SAT") {
      filteredStudents = students.filter(
        (student) =>
          student.category == "SAT" && student.classroom == schema.classroom
      );
    }
    resetManagerPanelClassSheet(sheet, filteredStudents, schema);
  }

  const metadataTable = getManagerPanelMetadataTable(managerPanelSpreadsheet);
  metadataTable.setValue("날짜", "값", getTodayDateString());
  metadataTable.paint();
}

function resetManagerPanelClassSheet(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  students: Student[],
  schema: ClassManagementPanelSchema
) {
  const table = new Table(sheet, "이름", 1);

  table.clearContents();
  table.clearDataValidations();

  table.setHeaders(
    [
      "ID",
      "유형",
      "반",
      "이름",
      "학년",
      "성별",
      "수학",
      "상점",
      "벌점",
      "상벌점",
      "부모님 전화번호",
    ],
    1
  );
  if (schema.category == "TOEFL") {
    table.addHeader("단어시험");
    table.addHeader("재시험");
  }
  schema.timeslots.forEach((timeslot) => table.addHeader(timeslot));
  table.paint();

  const names = students.map((student) => student.name);
  table.setIds(names);
  table.paint();

  for (const student of students) {
    table.setValue(student.name, "ID", student.id);
    table.setValue(student.name, "유형", student.category);
    table.setValue(student.name, "반", student.classroom);
    table.setValue(student.name, "학년", student.grade);
    table.setValue(student.name, "성별", student.gender);
    table.setValue(student.name, "수학", student.math);
    table.setValue(student.name, "상점", student.meritPoints);
    table.setValue(student.name, "벌점", student.demeritPoints);
    table.setValue(student.name, "상벌점", student.meritPointsTotal);
    table.setValue(student.name, "부모님 전화번호", student.parentPhoneNumber);

    for (const timeslot of schema.timeslots) {
      table.setDropdown(student.name, timeslot, attendanceChoices);
    }
  }

  table.paint();

  basicColor(table);
}

function updateDBWithManagerPanelClassData(
  dbSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
  managerPanelSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
  managerPanelSchema: ClassManagementPanelSchema[]
) {
  const metadataTable = getManagerPanelMetadataTable(managerPanelSpreadsheet);
  const today = toDateString(new Date(metadataTable.getValue("날짜", "값")));

  const wordTestTable = getDBWordTestTable(dbSpreadsheet);

  const attendanceTable = getDBAttendanceTable(dbSpreadsheet);

  for (const schema of managerPanelSchema) {
    const sheetName = `${schema.category} ${schema.classroom}`;
    const sheet = managerPanelSpreadsheet.getSheetByName(sheetName);
    const classTable = new Table(sheet, "이름", 1);
    const studentNames = classTable.getIds();

    for (const name of studentNames) {
      // Update Word Test Score
      const score = classTable.getValue(name, "단어시험");
      if (score) {
        wordTestTable.setValue(name, `${today}(정)`, score);
      }
      const retestScore = classTable.getValue(name, "재시험");
      if (retestScore) {
        wordTestTable.setValue(name, `${today}(재)`, retestScore);
      }

      // Update Attendance
      for (const timeslot of schema.timeslots) {
        const state = classTable.getValue(name, timeslot);
        if (state) {
          const header = createAttendanceHeader(today, timeslot);
          attendanceTable.setValue(name, header, state);
        }
      }
    }
  }

  wordTestTable.paint();
  attendanceTable.paint();
}
