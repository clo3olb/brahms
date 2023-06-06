function createTestingSpreadsheet(values: any[][]) {
  const spreadsheet = SpreadsheetApp.create("Testing Spreadsheet");
  const sheet = spreadsheet.getSheets()[0];
  const range = sheet.getRange(1, 1, values.length, values[0].length);
  range.setValues(values);

  function remove() {
    const spreadsheetID = spreadsheet.getId();
    const file = DriveApp.getFileById(spreadsheetID);
    file.setTrashed(true);
  }

  return { spreadsheet, remove };
}

function TestTable() {
  const test = new UnitTest();

  const TEST_DEFAULT_VALUES = [
    ["반", "이름", "성별", "단어시험"],
    ["새싹반", "홍길동", "남", "80"],
    ["새싹반", "김길동", "여", "90"],
  ];

  const { spreadsheet, remove } = createTestingSpreadsheet(TEST_DEFAULT_VALUES);

  const sheet = spreadsheet.getSheets()[0];
  const table = new Table(sheet, "이름", 1);

  // Test - getValue
  test.assert(
    "남",
    table.getValue("홍길동", "성별"),
    "Table.getValue must return correct value"
  );
  test.assert(
    "80",
    table.getValue("홍길동", "단어시험"),
    "Table.getValue must return correct value"
  );

  // Test - setValue
  table.setValue("홍길동", "단어시험", "100");
  table.paint();
  test.assert(
    table.getValue("홍길동", "단어시험"),
    "100",
    "Table.setValue must set values correctly"
  );
  table.setValue("홍길동", "새로운 헤더", "새로운 값");
  table.paint();
  test.assert(
    table.getValue("홍길동", "새로운 헤더"),
    "새로운 값",
    "Table.setValue must set values with new header correctly"
  );

  // Test - getIds
  const ids = table.getIds();
  test.assert(
    ["홍길동", "김길동"],
    ids,
    "Table.getIds must return ids correctly"
  );

  // Test - clearContents
  table.clearContents();
  const clearedHeaders = table.sheet.getRange(1, 1, 1, 4).getValues()[0];
  test.assert(
    ["", "", "", ""],
    clearedHeaders,
    "Table.clearContents must remove all the contents"
  );

  // Test - setHeaders
  table.setHeaders(["반", "이름", "성별", "출석"], 1);
  table.paint();
  const newHeaders = table.sheet.getRange(1, 1, 1, 4).getValues()[0];
  test.assert(
    ["반", "이름", "성별", "출석"],
    newHeaders,
    "Table.setHeaders must set correct headers"
  );

  // Test - setIds
  table.setIds(["이길동", "박길동"]);
  table.paint();
  test.assert(
    ["이길동", "박길동"],
    table.getIds(),
    "Table.setIds must set ids"
  );

  // Test - addId
  table.addId("최길동");
  table.paint();
  test.assert(
    ["이길동", "박길동", "최길동"],
    table.getIds(),
    "Table.addId must add id"
  );

  // Test - addId
  table.sort("이름");
  test.assert(
    ["박길동", "이길동", "최길동"],
    table.getIds(),
    "Table.sort must sort"
  );

  // Test - addId
  table.customSort("이름", ["최길동", "이길동", "박길동"]);
  test.assert(
    ["최길동", "이길동", "박길동"],
    table.getIds(),
    "Table.customSort must sort in custom order"
  );

  // Test - setDropdown
  table.setDropdown("이길동", "성별", ["남", "여"]);
  table.paint();
  test.assert(
    1,
    table.sheet.getRange(2, 3).getDataValidations().length,
    "Table.setDropdown must set data validation"
  );

  remove();
}
