const AUTH_EMAIL_LIST = [
  "hyeonwookim@gvcs-mg.org",
  "clo3olb@gmail.com",
  "kyso8575@gmail.com",
];

function onOpen(event: GoogleAppsScript.Events.SheetsOnOpen) {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("관리자 도구")
    .addSubMenu(
      ui
        .createMenu("DB")

        .addItem("학생 시트 전체 동기화", "UI_syncDBWithStudentInfo")
        .addItem("정렬 및 서식 적용", "UI_styleDB")
    )
    .addSubMenu(
      ui
        .createMenu("관리자 패널")
        .addItem(
          "관리자 패널 데이터를 DB로 업데이트",
          "UI_updateDBWithManagerPanelClassData"
        )
        .addItem(
          "관리자 패널 반별시트 오늘 날짜로 초기화",
          "UI_resetManagerPanel"
        )
        .addItem(
          "DB 데이터를 관리자 패널로 복구",
          "UI_recoverManagerPanelFromDB"
        )
        .addItem(
          "관리자 패널 과제시트 초기화",
          "resetManagerPanel_NOT_YET_IMPLEMENTED"
        )
    )

    .addSubMenu(
      ui
        .createMenu("상벌점")
        .addItem("상벌점 설문지 동기화", "UI_updateMeritPointsFormReasons")
        .addItem(
          "상벌점 설문지 응답 전체 업데이트",
          "UI_updateAllMeritPointsFormResponsesToDB"
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

  const spreadsheet_ES = SpreadsheetApp.openById(ES_DB_SHEET_ID);
  ScriptApp.newTrigger("onOpen")
    .forSpreadsheet(spreadsheet_ES)
    .onOpen()
    .create();

  const spreadsheet_US = SpreadsheetApp.openById(US_DB_SHEET_ID);
  ScriptApp.newTrigger("onOpen")
    .forSpreadsheet(spreadsheet_US)
    .onOpen()
    .create();
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
  const form_ES = FormApp.openById(ES_MERIT_FORM_ID);
  ScriptApp.newTrigger("onMeritPointFormSubmit")
    .forForm(form_ES)
    .onFormSubmit()
    .create();

  const form_US = FormApp.openById(US_MERIT_FORM_ID);
  ScriptApp.newTrigger("onMeritPointFormSubmit")
    .forForm(form_US)
    .onFormSubmit()
    .create();
}

function onMeritPointFormSubmit(
  event: GoogleAppsScript.Events.FormsOnFormSubmit
) {
  const title = event.source.getTitle();
  if (title.includes("음성")) {
    const dbSpreadsheet = SpreadsheetApp.openById(ES_DB_SHEET_ID);
    updateMeritPontFormResponse(dbSpreadsheet, event.response);
  } else if (title.includes("미국")) {
    const dbSpreadsheet = SpreadsheetApp.openById(US_DB_SHEET_ID);
    updateMeritPontFormResponse(dbSpreadsheet, event.response);
  }
}
