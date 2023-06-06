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

  const metadataSheet = managerSpreadsheet.getSheetByName("Metadata");
  const metadataTable = new Table(metadataSheet, "항목", 1);
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

  basicSort(table);
  basicColor(table);
}

function updateDB() {
  const managerSpreadsheet = SpreadsheetApp.openById(MANAGER_SHEET_ID);
  const metadataSheet = managerSpreadsheet.getSheetByName("Metadata");
  const metadataTable = new Table(metadataSheet, "항목", 1);
  const today = metadataTable.getValue("날짜", "값");

  const dbSpreadsheet = SpreadsheetApp.openById(DB_SHEET_ID);

  const wordTestSheet = dbSpreadsheet.getSheetByName("단어시험");
  const wordTestTable = new Table(wordTestSheet, "이름", 1);

  const attendanceSheet = dbSpreadsheet.getSheetByName("출석");
  const attendanceTable = new Table(attendanceSheet, "이름", 1);

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
          const header = `${today} - ${timeslot}`;
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

  const wordTestSheet = dbSpreadsheet.getSheetByName("단어시험");
  const wordTestTable = new Table(wordTestSheet, "이름", 1);

  const attendanceSheet = dbSpreadsheet.getSheetByName("출석");
  const attendanceTable = new Table(attendanceSheet, "이름", 1);

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

  const studentSheet = dbSpreadsheet.getSheetByName("학생");
  const studentTable = new Table(studentSheet, "이름", 1);

  const wordTestSheet = dbSpreadsheet.getSheetByName("단어시험");
  const wordTestTable = new Table(wordTestSheet, "이름", 1);

  const attendanceSheet = dbSpreadsheet.getSheetByName("출석");
  const attendanceTable = new Table(attendanceSheet, "이름", 1);

  basicSort(studentTable);
  basicColor(studentTable);

  basicSort(wordTestTable);
  basicColor(wordTestTable);

  basicSort(attendanceTable);
  basicColor(attendanceTable);
}
