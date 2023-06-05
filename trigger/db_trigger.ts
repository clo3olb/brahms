function onDBOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("관리자 도구")
    .addSubMenu(
      ui
        .createMenu("학습TA 관리자 패널")
        .addItem("출석시트 새로고침", "resetTeacherAttendanceSheet")
        .addItem("출석시트 DB로 전송", "updateAttendance")
    )
    .addToUi();
}

function addDBTrigger() {
  const spreadsheet = getDBSpreadsheet();
  ScriptApp.newTrigger("onDBOpen")
    .forSpreadsheet(spreadsheet)
    .onOpen()
    .create();
}
