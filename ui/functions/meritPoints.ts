function updateMeritPontFormResponse(
  dbSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
  response: GoogleAppsScript.Forms.FormResponse
) {
  const meritSheet = dbSpreadsheet.getSheetByName("상벌점");
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

// 상벌점 설문지에서 제출된 모든 응답을, DB로 업데이트. 중복이 있으면 스킵.
function updateAllMeritPointsFormResponsesToDB(
  dbSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
  meritPointForm: GoogleAppsScript.Forms.Form
) {
  const responses = meritPointForm.getResponses();
  for (const response of responses) {
    updateMeritPontFormResponse(dbSpreadsheet, response);
  }
}

function updateMeritPointsFormReasons(
  dbSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
  meritPointForm: GoogleAppsScript.Forms.Form
) {
  const meritPointTable = getDBMeritPointListTable(dbSpreadsheet);
  const students = getStudents(dbSpreadsheet);

  const ids = meritPointTable.getIds();
  const pointList = ids.map((id) => ({
    reason: meritPointTable.getValue(id, "사유"),
    category: meritPointTable.getValue(id, "유형"),
    point: meritPointTable.getValue(id, "점수"),
  }));

  const items = meritPointForm.getItems();

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
