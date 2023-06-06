function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("관리자 도구")
    .addSubMenu(
      ui
        .createMenu("관리자 패널")
        .addItem("관리자 패널 초기화", "resetManagerPanel")
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
    .addToUi();
}

function addMenuTrigger() {
  // Becareful. This function must be ran only one time.

  const spreadsheet = SpreadsheetApp.openById(DB_SHEET_ID);
  ScriptApp.newTrigger("onOpen").forSpreadsheet(spreadsheet).onOpen().create();
}

function onEdit(e) {
  updateDB();
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
