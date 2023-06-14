const AUTH_EMAIL_LIST = [
  "hyeonwookim@gvcs-mg.org",
  "clo3olb@gmail.com",
  "kyso8575@gmail.com",
];

function onOpen(event: GoogleAppsScript.Events.SheetsOnOpen) {
  const email = event.user.getEmail();
  if (!AUTH_EMAIL_LIST.includes(email)) return;

  const ui = SpreadsheetApp.getUi();
  ui.createMenu("관리자 도구")
    .addSubMenu(
      ui
        .createMenu("관리자 패널")
        .addItem("관리자 패널 초기화", "resetManagerPanel")
        .addItem("관리자 패널 복구", "recoverManagerPanelFromDB")
    )
    .addSeparator()
    .addSubMenu(
      ui
        .createMenu("DB")
        .addSubMenu(
          ui
            .createMenu("업데이트")
            .addItem(" 관리자 패널 -> DB", "updateDB")
            .addItem(" DB 학생 -> DB 전체", "syncDBWithStudentInfo")
        )
        .addItem("정렬 및 서식 적용", "styleDB")
    )
    .addSubMenu(
      ui
        .createMenu("상벌점")
        .addItem("상벌점 설문지 동기화", "updateMeritPointsForm")
        .addItem(
          "상벌점 설문지 응답 전체 업데이트",
          "updateAllMeritPointsFormResponsesToDB"
        )
    )
    .addSubMenu(
      ui
        .createMenu("메세지 전송")
        .addItem("단어시험 메세지 전송", "sendWordTestScoreMessage")
    )
    .addToUi();
}

function addMenuTrigger() {
  // Becareful. This function must be ran only one time.

  const spreadsheet = SpreadsheetApp.openById(DB_SHEET_ID);
  ScriptApp.newTrigger("onOpen").forSpreadsheet(spreadsheet).onOpen().create();
}

function onEdit(e: GoogleAppsScript.Events.SheetsOnEdit) {
  const sheetName = e.range.getSheet().getName();
  switch (sheetName) {
    case "TOEFL 도약반":
    case "TOEFL 인터반":
    case "TOEFL 정규반":
    case "TOEFL 실전반":
    case "SAT 정규반":
    case "SAT 실전반":
      updateDB();
      break;
    default:
      break;
  }
}

function addSyncTrigger() {
  // Becareful. This function must be ran only one time.

  const spreadsheet = SpreadsheetApp.openById(MANAGER_SHEET_ID);
  ScriptApp.newTrigger("onEdit").forSpreadsheet(spreadsheet).onEdit().create();
}

function removeAllTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    ScriptApp.deleteTrigger(trigger);
  }
}

function createUUID() {
  return Utilities.getUuid();
}

function addMeritPointFormOnSubmitTrigger() {
  // Find form and add trigger 'onMeritPointFormSubmit'
  const form = FormApp.openById(MERIT_FORM_ID);
  ScriptApp.newTrigger("onMeritPointFormSubmit")
    .forForm(form)
    .onFormSubmit()
    .create();
}

function onMeritPointFormSubmit(
  event: GoogleAppsScript.Events.FormsOnFormSubmit
) {
  updateMeritPontFormResponse(event.response);
}
