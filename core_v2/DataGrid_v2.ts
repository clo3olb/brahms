class DataGridV2 {
  sheet: GoogleAppsScript.Spreadsheet.Sheet;
  range: GoogleAppsScript.Spreadsheet.Range;
  values: any[][];
  idHeader: string;
  constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet, idHeader: string) {
    if (!sheet) throw `sheet must be provided`;
    this.sheet = sheet;
    this.idHeader = idHeader;
  }

  _getValues() {
    if (!this.range) {
      this.range = this.sheet.getRange(
        1,
        1,
        this.sheet.getMaxRows(),
        this.sheet.getMaxColumns()
      );
    }
    if (!this.values) {
      this.values = this.range.getDisplayValues();
    }
    return this.values;
  }

  _getColumnIndex(header: string) {
    const columnIndex = this._getHeaderRow().findIndex((h) => h == header);
    return columnIndex;
  }

  _getRowIndex(id: any) {
    const idColumnIndex = this._getColumnIndex(this.idHeader);
    const values = this._getValues();
    const ids = values.map((v) => v[idColumnIndex]);
    const rowIndex = ids.findIndex((v) => v == id);
    if (rowIndex < 0)
      throw new DataGridError(this.sheet, `cannot find row with id: ${id}`);
    return rowIndex;
  }

  _getHeaderRow() {
    return this._getValues()[0];
  }

  getValue(id: any, header: string) {
    const values = this._getValues();
    const columnIndex = this._getColumnIndex(header);
    const rowIndex = this._getRowIndex(id);

    return values[rowIndex][columnIndex];
  }

  getAllIds() {
    const columnIndex = this._getColumnIndex(this.idHeader);
    return onlyValues(this._getValues().map((row) => row[columnIndex]));
  }

  setValue(id: any, header: string, value: any) {
    try {
      const columnIndex = this._getColumnIndex(header);
    } catch (err) {}
    const columnIndex = this._getColumnIndex(header);
    const rowIndex = this._getRowIndex(id);

    this.values[rowIndex][columnIndex] = value;
  }

  setDropdown(id: any, header: string, values: string[]) {
    const rowIndex = this._getRowIndex(id);
    const columnIndex = this._getColumnIndex(header);
    const range = this.sheet.getRange(rowIndex + 1, columnIndex + 1);
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(values)
      .build();
    range.setDataValidation(rule);
  }

  addHeader(header: string) {
    const headerIndex = this._getHeaderRow().findIndex(
      (h) => h == "" || h == undefined
    );
    Logger.log({ headerIndex, header });
    this.values[0][headerIndex] = header;
  }

  addRow(id: any) {
    const idColumnIndex = this._getColumnIndex(this.idHeader);

    // If there is no empty row, add one and sync
    if (this._getValues().findIndex((row) => row[idColumnIndex] == "") < 0) {
      this.sheet.insertRowAfter(this.sheet.getMaxRows());
      this._sync();
    }

    // Find empty row
    const rowIndex = this._getValues().findIndex(
      (row) => row[idColumnIndex] == ""
    );
    this.values[rowIndex][idColumnIndex] = id;
  }

  paint() {
    this.range.setValues(this.values);
    SpreadsheetApp.flush();
    this._sync();
  }

  _sync() {
    this.range = this.sheet.getRange(
      1,
      1,
      this.sheet.getMaxRows(),
      this.sheet.getMaxColumns()
    );
    this.values = this.range.getDisplayValues();
  }

  clearContents() {
    this.sheet.clearContents();
    this._sync();
  }

  clearDataValidations() {
    this.sheet
      .getRange(1, 1, this.sheet.getMaxRows(), this.sheet.getMaxColumns())
      .clearDataValidations();
  }
}

function onlyValues<T>(list: T[]): T[] {
  return list.filter((v) => v != "" && v != undefined);
}

class DataGridError extends Error {
  constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet, message: string) {
    super(`Data Grid Error
Spreadsheet: ${sheet.getParent().getName()}
Sheet: ${sheet.getName()}
Message: ${message}`);
  }
}
