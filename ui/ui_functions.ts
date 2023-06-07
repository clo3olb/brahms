type ClassManagementPanelSchema = {
  category: string;
  classroom: string;
  timeslots: string[];
};

const managerPanelSchema: ClassManagementPanelSchema[] = [
  {
    category: "TOEFL",
    classroom: "도약반",
    timeslots: ["1교시", "2교시", "3교시"],
  },
  {
    category: "TOEFL",
    classroom: "인터반",
    timeslots: ["1교시", "2교시", "3교시"],
  },
  {
    category: "TOEFL",
    classroom: "정규반",
    timeslots: ["1교시", "2교시", "3교시"],
  },
  {
    category: "TOEFL",
    classroom: "실전반",
    timeslots: ["1교시", "2교시", "3교시"],
  },
  {
    category: "SAT",
    classroom: "정규반",
    timeslots: ["1교시", "2교시", "3교시"],
  },
  {
    category: "SAT",
    classroom: "실전반",
    timeslots: ["1교시", "2교시", "3교시"],
  },
];

const attendanceChoices = ["출석", "결석", "병결", "기타"];

function recoverManagerPanelFromDB() {
  const dbSpreadsheet = SpreadsheetApp.openById(DB_SHEET_ID);
  const managerPanelSpreadsheet = SpreadsheetApp.openById(MANAGER_SHEET_ID);

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
      const score = wordTestTable.getValue(name, dateStr);
      table.setValue(name, "단어시험", score);

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

function resetManagerPanel() {
  const managerSpreadsheet = SpreadsheetApp.openById(MANAGER_SHEET_ID);
  const students = getStudents();

  for (const schema of managerPanelSchema) {
    const sheetName = `${schema.category} ${schema.classroom}`;
    const sheet = managerSpreadsheet.getSheetByName(sheetName);
    const filteredStudents = students.filter(
      (student) =>
        student.category == schema.category &&
        student.classroom == schema.classroom
    );
    resetClassManagerPanel(sheet, filteredStudents, schema.timeslots);
  }

  const metadataTable = getManagerPanelMetadataTable(managerSpreadsheet);
  metadataTable.setValue("날짜", "값", getTodayDateString());
  metadataTable.paint();
}

function resetClassManagerPanel(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  students: Student[],
  timeslots: string[]
) {
  const table = new Table(sheet, "이름", 1);

  table.clearContents();
  table.clearDataValidations();

  table.setHeaders(
    ["ID", "유형", "반", "이름", "학년", "성별", "단어시험", ...timeslots],
    1
  );
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

    for (const timeslot of timeslots) {
      table.setDropdown(student.name, timeslot, attendanceChoices);
    }
  }

  table.paint();

  basicColor(table);
}

function updateDB() {
  const managerSpreadsheet = SpreadsheetApp.openById(MANAGER_SHEET_ID);
  const metadataTable = getManagerPanelMetadataTable(managerSpreadsheet);
  const today = metadataTable.getValue("날짜", "값");

  const dbSpreadsheet = SpreadsheetApp.openById(DB_SHEET_ID);

  const wordTestTable = getDBWordTestTable(dbSpreadsheet);

  const attendanceTable = getDBAttendanceTable(dbSpreadsheet);

  for (const schema of managerPanelSchema) {
    const sheetName = `${schema.category} ${schema.classroom}`;
    const sheet = managerSpreadsheet.getSheetByName(sheetName);
    const classTable = new Table(sheet, "이름", 1);
    const studentNames = classTable.getIds();

    for (const name of studentNames) {
      // Update Word Test Score
      const score = classTable.getValue(name, "단어시험");
      if (score) {
        wordTestTable.setValue(name, today, score);
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

function syncDBWithStudentInfo() {
  const students = getStudents();

  const dbSpreadsheet = SpreadsheetApp.openById(DB_SHEET_ID);

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

function updateStudentEssentials(table: Table, student: Student) {
  table.setValue(student.name, "ID", student.id);
  table.setValue(student.name, "유형", student.category);
  table.setValue(student.name, "반", student.classroom);
  table.setValue(student.name, "성별", student.gender);
  table.setValue(student.name, "학년", student.grade);
}

function styleDB() {
  const dbSpreadsheet = SpreadsheetApp.openById(DB_SHEET_ID);

  const studentTable = getDBStudentTable(dbSpreadsheet);

  const wordTestTable = getDBWordTestTable(dbSpreadsheet);

  const attendanceTable = getDBAttendanceTable(dbSpreadsheet);

  basicSort(studentTable);
  basicColor(studentTable);

  basicSort(wordTestTable);
  basicColor(wordTestTable);

  basicSort(attendanceTable);
  basicColor(attendanceTable);
}

function sendWordTestScoreMessage() {
  const today = getTodayDateString();

  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    "알림",
    `${today} 단어시험 결과를 문자로 발송하시겠습니까?`,
    ui.ButtonSet.OK_CANCEL
  );
  if (response != ui.Button.OK) return;

  const students = getStudents();
  const dbSpreadsheet = SpreadsheetApp.openById(DB_SHEET_ID);
  const wordTestScoreSheet = dbSpreadsheet.getSheetByName("단어시험");
  const wordTestScoreTable = new Table(wordTestScoreSheet, "이름", 1);
  const messageTemplateSheet = dbSpreadsheet.getSheetByName("메세지 템플릿");
  const messageTemplateTable = new Table(
    messageTemplateSheet,
    "메세지 종류",
    1
  );
  const messageLogTable = getDBMessageLogTable(dbSpreadsheet);

  const wordTestScoreMessageTemplate = messageTemplateTable.getValue(
    "단어시험",
    "템플릿"
  );
  const messageSender = new MessageSender(
    "RANDOM_STRING",
    "RANDOM_STRING",
    "RANDOM_STRING",
    "RANDOM_STRING",
    messageLogTable
  );

  for (const student of students) {
    const score = wordTestScoreTable.getValue(student.name, today);
    const message = createMessageFromTemplate(
      wordTestScoreMessageTemplate,
      student,
      { score: score }
    );
    messageSender.send(message, student.parentPhoneNumber);
    Logger.log(message);
  }
}
