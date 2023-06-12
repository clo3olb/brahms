function onOpen() {
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
        .addItem("상벌점 시트 헤더 업데이트", "updateMeritSheetHeaders")
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
  const form = FormApp.openById(FORM_ID);
  ScriptApp.newTrigger("onMeritPointFormSubmit")
    .forForm(form)
    .onFormSubmit()
    .create();
}

function onMeritPointFormSubmit(
  event: GoogleAppsScript.Events.FormsOnFormSubmit
) {
  const response = event.response;
  const dbSpreadSheet = SpreadsheetApp.openById(DB_SHEET_ID);
  const meritSheet = dbSpreadSheet.getSheetByName("상벌점");
  const meritTable = new Table(meritSheet, "학생 이름", 1);
  const itemResponses = response.getItemResponses();

  // Get information from the form
  const items = {};
  items["이메일"] = response.getRespondentEmail();
  items["타임 스탬프"] = response.getTimestamp();
  items["날짜"] = `${response.getTimestamp().getMonth() + 1}월 ${response
    .getTimestamp()
    .getDay()}일`;
  for (let i = 0; i < itemResponses.length; i++) {
    items[itemResponses[i].getItem().getTitle()] =
      itemResponses[i].getResponse();
  }

  // Update meritTable values
  meritTable.getIds();

  // update DB sheet
  const headers = meritTable.values[0];
  let keys = Object.keys(items);
  let input = new Array(headers.length);
  for (let i = 0; i < headers.length; i++) {
    let headerIndex = headers.findIndex((header) => header == keys[i]);

    input[headerIndex] = items[keys[i]];
  }

  if (
    meritTable.sheet.getMaxRows() ==
    meritTable.headerRowIndex + meritTable.getIds().length
  ) {
    meritTable.sheet.insertRowAfter(meritTable.sheet.getMaxRows());
    meritTable.range = meritTable.sheet.getRange(
      1,
      1,
      meritTable.sheet.getMaxRows(),
      meritTable.sheet.getMaxColumns()
    );
  }

  meritTable.values[meritTable.sheet.getLastRow()] = input;

  meritTable.paint();
}

function updateMeritSheetHeaders() {
  const dbSpreadSheet = SpreadsheetApp.openById(DB_SHEET_ID);
  const meritSheet = dbSpreadSheet.getSheetByName("상벌점");
  const meritForm = FormApp.openById(FORM_ID);
  const meritTable = new Table(meritSheet, "학생 이름", 1);

  // update values
  meritTable.getIds();
  let headers = meritTable.values[0];

  // delete header row
  let headerRowRange = meritTable.sheet.getRange(
    meritTable.headerRowIndex,
    1,
    1,
    meritTable.sheet.getLastColumn()
  );
  headerRowRange.clearContent();

  // get header contents
  let newHeaders = meritForm.getItems().map((item) => {
    if (
      item.getType() != FormApp.ItemType.SECTION_HEADER &&
      item.getType() != FormApp.ItemType.PAGE_BREAK
    ) {
      return item.getTitle();
    }
  });
  newHeaders.push("이메일");
  newHeaders.unshift("타임 스탬프");
  newHeaders.unshift("날짜");

  newHeaders = newHeaders.filter((item) => item);

  for (let i = 0; i < newHeaders.length; i++) {
    if (!headers.find((header) => newHeaders[i] == header)) {
      headers.push(newHeaders[i]);
    }
  }

  headers = headers.filter((item) => item);

  if (meritTable.sheet.getMaxColumns() < headers.length) {
    meritTable.sheet.insertColumnAfter(meritTable.sheet.getMaxColumns());
    meritTable.range = meritTable.sheet.getRange(
      1,
      1,
      meritTable.sheet.getMaxRows(),
      meritTable.sheet.getMaxColumns()
    );
  }

  // update header row
  meritTable.sheet
    .getRange(meritTable.headerRowIndex, 1, 1, headers.length)
    .setValues([headers]);
}
