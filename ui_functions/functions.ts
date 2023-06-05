const managerSheetSchema = [
  {
    category: "TOEFL",
    className: "도약반",
    columns: ["유형", "이름", "반", "단어시험", "1교시", "2교시"],
  },
  {
    category: "TOEFL",
    className: "인터반",
    columns: ["유형", "이름", "반", "단어시험", "1교시", "2교시"],
  },
  {
    category: "TOEFL",
    className: "정규반",
    columns: ["유형", "이름", "반", "단어시험", "1교시", "2교시"],
  },
  {
    category: "TOEFL",
    className: "실전반",
    columns: ["유형", "이름", "반", "단어시험", "1교시", "2교시"],
  },
  {
    category: "SAT",
    className: "정규반",
    columns: ["유형", "이름", "반", "단어시험", "1교시", "2교시"],
  },
  {
    category: "SAT",
    className: "실전반",
    columns: ["유형", "이름", "반", "단어시험", "1교시", "2교시"],
  },
];

const attendanceValues = ["출석", "결석", "기타", "병결"];

function resetTeacherSheet() {
  // Get all students
  const dbSpreadsheet = getDBSpreadsheet();
  const studentSheet = dbSpreadsheet.getSheetByName(DB_SHEET_NAMES.STUDENT);
  const studentDataGrid = new DataGridV2(
    studentSheet,
    COLUMN_HEADERS.STUDENT.NAME
  );
  const students = getAllStudents(studentDataGrid);

  // Get Manager Spreadsheet
  const managerSpreadSheet = getManagerSpreadsheet();

  // For every classroom
  for (let schema of managerSheetSchema) {
    const targetStudents = students.filter(
      (student) =>
        student.classroom == schema.className &&
        student.category == schema.category
    );
    const studentNames = targetStudents.map((s) => s.name);
    const sheet = managerSpreadSheet.getSheetByName(
      `${schema.category} ${schema.className}`
    );
    const managerDataGrid = new DataGridV2(sheet, COLUMN_HEADERS.STUDENT.NAME);

    // Reset Table(Sheet)
    managerDataGrid.clearContents();
    managerDataGrid.clearDataValidations();

    // Set Headers
    for (const header of schema.columns) {
      managerDataGrid.addHeader(header);
    }
    managerDataGrid.paint();

    // Set student names
    for (const name of studentNames) {
      managerDataGrid.addRow(name);
    }
    managerDataGrid.paint();

    for (let student of targetStudents) {
      for (let column of schema.columns) {
        switch (column) {
          case "이름":
            break;
          case "단어시험":
            break;
          case "유형":
            managerDataGrid.setValue(student.name, column, student.category);
            break;
          case "반":
            managerDataGrid.setValue(student.name, column, student.classroom);
            break;
          default:
            managerDataGrid.setDropdown(student.name, column, attendanceValues);
        }
      }
    }

    managerDataGrid.paint();
  }
}

function updateDataFromManagerSheet() {
  // Get all students
  const dbSpreadsheet = getDBSpreadsheet();

  const wordTestScoreSheet = dbSpreadsheet.getSheetByName(
    DB_SHEET_NAMES.WORD_TEST_SCORE
  );
  const wordTestScoreDataGrid = new DataGridV2(
    wordTestScoreSheet,
    COLUMN_HEADERS.STUDENT.NAME
  );

  const attendanceSheet = dbSpreadsheet.getSheetByName(
    DB_SHEET_NAMES.ATTENDANCE
  );
  const attendanceDataGrid = new DataGridV2(
    attendanceSheet,
    COLUMN_HEADERS.STUDENT.NAME
  );

  const managerSpreadsheet = getManagerSpreadsheet();

  for (let schema of managerSheetSchema) {
    const sheet = managerSpreadsheet.getSheetByName(
      `${schema.category} ${schema.className}`
    );
    const managerDataGrid = new DataGridV2(sheet, COLUMN_HEADERS.STUDENT.NAME);

    const studentNames = managerDataGrid.getAllIds();

    for (let name of studentNames) {
      for (let column of schema.columns) {
        switch (column) {
          case "이름":
          case "반":
          case "유형":
            break;
          case "단어시험":
            const rawScore = managerDataGrid.getValue(name, column);
            wordTestScoreDataGrid.setValue(name, getTodayDate(), rawScore);
            break;
          default:
            const state = managerDataGrid.getValue(name, column);
            attendanceDataGrid.setValue(
              name,
              `${getTodayDate()} ${column}`,
              state
            );
        }
      }
    }
    wordTestScoreDataGrid.paint();
    attendanceDataGrid.paint();
  }
}

function getTodayDate() {
  const dateObj = new Date();
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const date = dateObj.getDate();
  return `${year}년 ${month}월 ${date}일`;
}
