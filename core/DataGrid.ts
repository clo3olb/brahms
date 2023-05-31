class DataGrid {
  spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet;
  sheet: GoogleAppsScript.Spreadsheet.Sheet;
  headers: string[];
  range: GoogleAppsScript.Spreadsheet.Range;
  values: any[][];
  idHeader: string;

  constructor(
    spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
    sheetName: string,
    headers: string[],
    idHeader: string
  ) {
    this.spreadsheet = spreadsheet;
    this.sheet = this.spreadsheet.getSheetByName(sheetName);
    if (!this.sheet)
      throw `Sheet with the name ${sheetName} does not exist in ${this.spreadsheet.getName()}`;
    this.headers = headers;
    this.idHeader = idHeader;

    this.sync();
  }

  getCoordinate(id: any, header: string) {
    const rowIndex = this.getIdColumns().findIndex((idValue) => idValue == id);
    const columnIndex = this.getHeaders().findIndex(
      (gridHeader) => gridHeader == header
    );
    return { row: rowIndex, column: columnIndex };
  }

  getValue(id: any, header: string) {
    const { row, column } = this.getCoordinate(id, header);
    return this.values[row][column];
  }

  setValue(id: any, header: string, value: any) {
    const { row, column } = this.getCoordinate(id, header);
    this.values[row][column] = value;
  }

  getIdColumns() {
    const idHeaderIndex = this.getIdHeaderIndex();
    return this.getValues().map((row) => row[idHeaderIndex]);
  }

  getIdHeaderIndex() {
    return this.getHeaders().findIndex((header) => this.idHeader == header);
  }

  setIdColumns(columnValues: string[]) {
    const headerIndex = this.headers.findIndex((h) => h == this.idHeader);
    if (headerIndex < 0)
      throw `cannot find ${
        this.idHeader
      } from headers of the sheet ${this.sheet.getName()}`;

    if (this.sheet.getMaxRows() < columnValues.length + 1) {
      this.sheet.insertRowsAfter(
        this.sheet.getMaxRows(),
        columnValues.length - this.sheet.getMaxRows() + 10
      );
      this.sync();
    }

    for (let i = 0; i < columnValues.length; i++) {
      this.values[i + 1][headerIndex] = columnValues[i];
    }

    this.paint();
  }

  getHeaders() {
    return this.values[0];
  }

  setDropdown(id: any, header: string, values: string[]) {
    const { row, column } = this.getCoordinate(id, header);
    const range = this.sheet.getRange(row + 1, column + 1);
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(values)
      .build();
    range.setDataValidation(rule);
  }

  paint() {
    this.range.setValues(this.values);
    SpreadsheetApp.flush();
  }

  sync() {
    this.range = this.sheet.getRange(
      1,
      1,
      this.sheet.getMaxRows(),
      this.sheet.getMaxColumns()
    );
    this.values = this.range.getValues();
  }

  getValues() {
    if (!this.range || !this.values) this.sync();
    return this.values;
  }

  reset() {
    this.sheet.clearContents();

    const totalRange = this.sheet.getRange(
      1,
      1,
      this.sheet.getMaxRows(),
      this.sheet.getMaxColumns()
    );
    totalRange.clearDataValidations();

    const range = this.sheet.getRange(1, 1, 1, this.headers.length);
    range.setValues([this.headers]);
    this.sync();
  }
}
