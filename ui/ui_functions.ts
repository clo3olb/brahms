type ClassManagementPanelSchema = {
  category: string;
  classroom: string;
  timeslots: string[];
};

const managerPanelSchema: ClassManagementPanelSchema[] = [
  {
    category: "TOEFL",
    classroom: "도약반",
    timeslots: [
      "1교시",
      "2교시",
      "3교시",
      "4교시",
      "GS1",
      "GS2",
      "TP1",
      "TP2",
      "자습1",
      "자습2",
      "자습3",
    ],
  },
  {
    category: "TOEFL",
    classroom: "인터반",
    timeslots: [
      "1교시",
      "2교시",
      "3교시",
      "4교시",
      "GS1",
      "GS2",
      "TP1",
      "TP2",
      "자습1",
      "자습2",
      "자습3",
    ],
  },
  {
    category: "TOEFL",
    classroom: "정규반",
    timeslots: [
      "1교시",
      "2교시",
      "3교시",
      "4교시",
      "GS1",
      "GS2",
      "TP1",
      "TP2",
      "자습1",
      "자습2",
      "자습3",
    ],
  },
  {
    category: "TOEFL",
    classroom: "실전반",
    timeslots: [
      "1교시",
      "2교시",
      "3교시",
      "4교시",
      "GS1",
      "GS2",
      "TP1",
      "TP2",
      "자습1",
      "자습2",
      "자습3",
    ],
  },
  {
    category: "Math",
    classroom: "Algebra 2",
    timeslots: ["자습1", "자습2"],
  },
  {
    category: "Math",
    classroom: "Geometry",
    timeslots: ["자습1", "자습2"],
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

function resetManagerPanel() {
  const managerSpreadsheet = SpreadsheetApp.openById(MANAGER_SHEET_ID);
  const students = getStudents();

  for (const schema of managerPanelSchema) {
    const sheetName = `${schema.category} ${schema.classroom}`;
    const sheet = managerSpreadsheet.getSheetByName(sheetName);
    const filteredStudents = students.filter(
      (student) =>
        student.classroom == schema.classroom ||
        student.math == schema.classroom
    );
    resetClassManagerPanel(sheet, filteredStudents, schema);
  }

  const metadataTable = getManagerPanelMetadataTable(managerSpreadsheet);
  metadataTable.setValue("날짜", "값", getTodayDateString());
  metadataTable.paint();
}

function resetClassManagerPanel(
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

function updateDB() {
  const managerSpreadsheet = SpreadsheetApp.openById(MANAGER_SHEET_ID);
  const metadataTable = getManagerPanelMetadataTable(managerSpreadsheet);
  const today = toDateString(new Date(metadataTable.getValue("날짜", "값")));

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

// 정렬 및 서식 적용
function styleDB() {
  const dbSpreadsheet = SpreadsheetApp.openById(DB_SHEET_ID);

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

function updateMeritPointsForm() {
  const form = FormApp.openById(MERIT_FORM_ID);

  const dbSpreadsheet = SpreadsheetApp.openById(DB_SHEET_ID);
  const meritPointTable = getDBMeritPointListTable(dbSpreadsheet);
  const students = getStudents();

  const ids = meritPointTable.getIds();
  const pointList = ids.map((id) => ({
    reason: meritPointTable.getValue(id, "사유"),
    category: meritPointTable.getValue(id, "유형"),
    point: meritPointTable.getValue(id, "점수"),
  }));

  const items = form.getItems();

  // 상벌점 사유 자동 업데이트
  const meritPointList = pointList.filter((p) => p.category == "상점");
  const demeritPointList = pointList.filter((p) => p.category == "벌점");

  const meritPointValues = meritPointList.map((p) => `${p.reason}(${p.point})`);
  const demeritPointValues = demeritPointList.map(
    (p) => `${p.reason}(${p.point})`
  );

  const meritPointItem = items.find((item) => item.getTitle() == "상점 사유");
  const demeritPointItem = items.find((item) => item.getTitle() == "벌점 사유");
  meritPointItem.asMultipleChoiceItem().setChoiceValues(meritPointValues);
  demeritPointItem.asMultipleChoiceItem().setChoiceValues(demeritPointValues);

  // 이름 정규식 업데이트
  const nameItem = items.find((item) => item.getTitle() == "학생 이름");
  const studentNames = students.map((s) => s.name);
  const studentNamesRegexPattern = `(${studentNames.join(`|`)})`;
  const rule = FormApp.createTextValidation()
    .requireTextMatchesPattern(studentNamesRegexPattern)
    .build();
  nameItem.asTextItem().setValidation(rule);
}

// 상벌점 설문지에서 제출된 모든 응답을, DB로 업데이트. 중복이 있으면 스킵.
function updateAllMeritPointsFormResponsesToDB() {
  const form = FormApp.openById(MERIT_FORM_ID);

  const responses = form.getResponses();
  for (const response of responses) {
    updateMeritPontFormResponse(response);
  }
}

function updateMeritPontFormResponse(
  response: GoogleAppsScript.Forms.FormResponse
) {
  const dbSpreadSheet = SpreadsheetApp.openById(DB_SHEET_ID);
  const meritSheet = dbSpreadSheet.getSheetByName("상벌점");
  const meritTable = new Table(meritSheet, "타임스탬프", 1);

  const timestamp = String(response.getTimestamp().getTime());
  if (meritTable.getIds().includes(timestamp)) return;

  const items = response.getItemResponses().map((r) => r.getItem());
  const nameItem = items.find((item) => item.getTitle() == "학생 이름");
  const categoryItem = items.find((item) => item.getTitle() == "유형");
  const reasonItem = items.find(
    (item) => item.getTitle() == "상점 사유" || item.getTitle() == "벌점 사유"
  );

  meritTable.addId(timestamp);

  const email = response.getRespondentEmail();
  const date = toDateString(new Date(response.getTimestamp().getTime()));
  const name = response.getResponseForItem(nameItem).getResponse() as string;
  const category = response
    .getResponseForItem(categoryItem)
    .getResponse() as string;
  const reasonAndPoint = response
    .getResponseForItem(reasonItem)
    .getResponse() as string;
  const reason = reasonAndPoint.slice(0, reasonAndPoint.indexOf("("));
  const point = reasonAndPoint.slice(reasonAndPoint.indexOf("(") + 1, -1);

  meritTable.setValue(timestamp, "이메일", email);
  meritTable.setValue(timestamp, "날짜", date);
  meritTable.setValue(timestamp, "학생 이름", name);
  meritTable.setValue(timestamp, "유형", category);
  meritTable.setValue(timestamp, "사유", reason);
  meritTable.setValue(timestamp, "점수", point);

  meritTable.paint();
  meritTable.sort("타임스탬프", false);
}

function test() {
  const dbSpreadSheet = SpreadsheetApp.openById(DB_SHEET_ID);
  const studentSheet = dbSpreadSheet.getSheetByName("학생");
  const range = studentSheet.getRange(2, 8);
  const value = range.getValue();
  const formula = range.getFormula();

  Logger.log({ value });
  Logger.log({ formula });
}
