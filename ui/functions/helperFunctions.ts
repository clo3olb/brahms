type Student = {
  id: string;
  category: string;
  name: string;
  classroom: string;
  grade: string;
  gender: string;
  parentEmail: string;
  parentPhoneNumber: string;
  math: string;
  meritPoints: string;
  demeritPoints: string;
  meritPointsTotal: string;
};

function getStudents(dbSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet) {
  const sheet = dbSpreadsheet.getSheetByName("학생");
  const table = new Table(sheet, "이름", 1);
  const names = table.getIds();
  const students: Student[] = [];

  for (const name of names) {
    students.push({
      id: table.getValue(name, "ID"),
      category: table.getValue(name, "유형"),
      name: name,
      classroom: table.getValue(name, "반"),
      grade: table.getValue(name, "학년"),
      gender: table.getValue(name, "성별"),
      parentEmail: table.getValue(name, "부모님 이메일"),
      parentPhoneNumber: table.getValue(name, "부모님 전화번호"),
      math: table.getValue(name, "수학"),
      meritPoints: table.getValue(name, "상점"),
      demeritPoints: table.getValue(name, "벌점"),
      meritPointsTotal: table.getValue(name, "상벌점"),
    });
  }

  return students;
}

function toDateString(dateObj: Date) {
  const today = new Date(dateObj);
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();

  return `${month}월 ${date}일`;
  //   return `${year}년 ${month}월 ${date}일`;
}

function getTodayDateString() {
  return toDateString(new Date());
}

function basicSort(table: Table) {
  table.sort("이름");
  table.customSort("반", ["도약반", "인터반", "정규반", "실전반"]);
  table.customSort("유형", ["TOEFL", "SAT"]);
}

function basicColor(table: Table) {
  const COLORS = {
    RED: "#f4cccc",
    ORANGE: "#fce5cd",
    YELLOW: "#fff2cc",
    GREEN: "#d9ead3",
    BLUE: "#c9daf8",
    PURPLE: "#d9d2e9",
  };
  const names = table.getIds();
  for (const name of names) {
    const classroom = table.getValue(name, "반");
    if (table.getValue(name, "유형") == "TOEFL") {
      switch (classroom) {
        case "도약반":
          table.colorRow(name, COLORS.RED);
          break;
        case "인터반":
          table.colorRow(name, COLORS.ORANGE);
          break;
        case "정규반":
          table.colorRow(name, COLORS.YELLOW);
          break;
        case "실전반":
          table.colorRow(name, COLORS.GREEN);
          break;
      }
    } else if (table.getValue(name, "유형") == "SAT") {
      switch (classroom) {
        case "정규반":
          table.colorRow(name, COLORS.BLUE);
          break;
        case "실전반":
          table.colorRow(name, COLORS.PURPLE);
          break;
      }
    }
  }
}

function createMessageFromTemplate(
  template: string,
  student: Student,
  values?: object
) {
  let message = template;
  if (values) {
    const keys = Object.keys(values);
    for (const key of keys) {
      const regex = new RegExp(`\{\{${key}\}\}`, "g");
      message = message.replace(regex, values[key]);
    }
  }

  message = message.replace(/\{\{name\}\}/g, student.name);
  message = message.replace(/\{\{category\}\}/g, student.category);
  message = message.replace(/\{\{classroom\}\}/g, student.classroom);
  message = message.replace(/\{\{gender\}\}/g, student.gender);
  message = message.replace(/\{\{grade\}\}/g, student.grade);
  message = message.replace(/\{\{id\}\}/g, student.id);
  message = message.replace(/\{\{parentEmail\}\}/g, student.parentEmail);
  message = message.replace(
    /\{\{parentPhoneNumber\}\}/g,
    student.parentPhoneNumber
  );
  return message;
}

function getManagerPanelMetadataTable(
  managerPanelSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet
) {
  const metadataSheet = managerPanelSpreadsheet.getSheetByName("Metadata");
  const metadataTable = new Table(metadataSheet, "항목", 1);
  return metadataTable;
}

function getDBWordTestTable(
  dbSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet
) {
  const wordTestSheet = dbSpreadsheet.getSheetByName("단어시험");
  const wordTestTable = new Table(wordTestSheet, "이름", 1);
  return wordTestTable;
}

function getDBStudentTable(
  dbSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet
) {
  const studentSheet = dbSpreadsheet.getSheetByName("학생");
  const studentTable = new Table(studentSheet, "이름", 1);
  return studentTable;
}

function getDBAttendanceTable(
  dbSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet
) {
  const attendanceSheet = dbSpreadsheet.getSheetByName("출석");
  const attendanceTable = new Table(attendanceSheet, "이름", 1);
  return attendanceTable;
}

function getDBMessageLogTable(
  dbSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet
) {
  const messageLogSheet = dbSpreadsheet.getSheetByName("메세지 로그");
  const messageLogTable = new Table(messageLogSheet, "메세지 ID", 1);
  return messageLogTable;
}

function getDBMessageTemplateTable(
  dbSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet
) {
  const messageTemplateSheet = dbSpreadsheet.getSheetByName("메세지 템플릿");
  const messageTemplateTable = new Table(
    messageTemplateSheet,
    "메세지 종류",
    1
  );
  return messageTemplateTable;
}

function getDBMeritPointListTable(
  dbSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet
) {
  const meritPointSheet = dbSpreadsheet.getSheetByName("상벌점 목록");
  const meritPointTable = new Table(meritPointSheet, "#", 1);
  return meritPointTable;
}
function getDBMetadataTable(
  dbSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet
) {
  const metadataSheet = dbSpreadsheet.getSheetByName("Metadata");
  const metadataTable = new Table(metadataSheet, "항목", 1);
  return metadataTable;
}

function getManagerPanelSpreadsheet(
  dbSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet
) {
  const metadataTable = getDBMetadataTable(dbSpreadsheet);
  const managerPanelID = metadataTable.getValue("관리자 패널 ID", "값");
  const managerPanelSpreadsheet = SpreadsheetApp.openById(managerPanelID);
  return managerPanelSpreadsheet;
}

function createAttendanceHeader(date: string, timeslot: string) {
  return `${date} - ${timeslot}`;
}
