function UI_styleDB() {
  const dbSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  styleDB(dbSpreadsheet);
}

function UI_syncDBWithStudentInfo() {
  const dbSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  syncDBWithStudentInfo(dbSpreadsheet);
}

function UI_updateDBWithManagerPanelClassData() {
  const dbSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const dbMetadataTable = getDBMetadataTable(dbSpreadsheet);
  const campus = dbMetadataTable.getValue("캠퍼스", "값");
  const managerPanelSpreadsheet = getManagerPanelSpreadsheet(dbSpreadsheet);
  switch (campus) {
    case CAMPUS.ES:
      updateDBWithManagerPanelClassData(
        dbSpreadsheet,
        managerPanelSpreadsheet,
        managerPanelSchema_ES
      );
      break;
    case CAMPUS.US:
      updateDBWithManagerPanelClassData(
        dbSpreadsheet,
        managerPanelSpreadsheet,
        managerPanelSchema_US
      );
      break;
    default:
      throw new Error(`정상적인 캠퍼스 값이 아닙니다. 값: ${campus}`);
  }
}

function UI_resetManagerPanel() {
  const dbSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const dbMetadataTable = getDBMetadataTable(dbSpreadsheet);
  const campus = dbMetadataTable.getValue("캠퍼스", "값");
  const managerPanelSpreadsheet = getManagerPanelSpreadsheet(dbSpreadsheet);
  switch (campus) {
    case CAMPUS.ES:
      resetManagerPanel(
        dbSpreadsheet,
        managerPanelSpreadsheet,
        managerPanelSchema_ES
      );
      break;
    case CAMPUS.US:
      resetManagerPanel(
        dbSpreadsheet,
        managerPanelSpreadsheet,
        managerPanelSchema_US
      );
      break;
    default:
      throw new Error(`정상적인 캠퍼스 값이 아닙니다. 값: ${campus}`);
  }
}

function UI_recoverManagerPanelFromDB() {
  const dbSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const dbMetadataTable = getDBMetadataTable(dbSpreadsheet);
  const campus = dbMetadataTable.getValue("캠퍼스", "값");
  const managerPanelSpreadsheet = getManagerPanelSpreadsheet(dbSpreadsheet);
  switch (campus) {
    case CAMPUS.ES:
      recoverManagerPanelFromDB(
        dbSpreadsheet,
        managerPanelSpreadsheet,
        managerPanelSchema_ES
      );
      break;
    case CAMPUS.US:
      recoverManagerPanelFromDB(
        dbSpreadsheet,
        managerPanelSpreadsheet,
        managerPanelSchema_US
      );
      break;
    default:
      throw new Error(`정상적인 캠퍼스 값이 아닙니다. 값: ${campus}`);
  }
}

function UI_updateAllMeritPointsFormResponsesToDB() {
  const dbSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const metadataTable = getDBMetadataTable(dbSpreadsheet);
  const formID = metadataTable.getValue("상벌점 설문지 ID", "값");
  const form = FormApp.openById(formID);
  updateAllMeritPointsFormResponsesToDB(dbSpreadsheet, form);
}

function UI_updateMeritPointsFormReasons() {
  const dbSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const metadataTable = getDBMetadataTable(dbSpreadsheet);
  const formID = metadataTable.getValue("상벌점 설문지 ID", "값");
  const form = FormApp.openById(formID);
  updateMeritPointsFormReasons(dbSpreadsheet, form);
}
