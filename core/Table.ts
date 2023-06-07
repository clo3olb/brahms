type SortSpec = {
  header: string;
  order: string[];
};

class Table {
  sheet: GoogleAppsScript.Spreadsheet.Sheet;
  range: GoogleAppsScript.Spreadsheet.Range;
  values: any[][];
  idHeader: any;
  headerRowIndex: number;

  constructor(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    idHeader: string,
    headerRowIndex: number
  ) {
    this.sheet = sheet;
    this.idHeader = idHeader;
    this.headerRowIndex = headerRowIndex;
    this.range = null;
    this.values = null;
  }

  public colorRow(id: string, color: string) {
    const rowIndex = this.getRowIndex(id);
    const headers = this.getHeaderRow().filter((v) => v != "");
    const rowNumber = rowIndex + 1;
    const range = this.sheet.getRange(rowNumber, 1, 1, headers.length);
    range.setBackground(color);
  }

  public customSort(header: string, order: string[]) {
    const ids = this.getIds();
    const CUSTOM_ORDER_TEMPORARY_HEADER = "CUSTOM_ORDER_TEMPORARY_HEADER";
    for (const id of ids) {
      const value = this.getValue(id, header);
      this.setValue(
        id,
        CUSTOM_ORDER_TEMPORARY_HEADER,
        order.findIndex((v) => v == value)
      );
    }
    this.paint();

    this.sort(CUSTOM_ORDER_TEMPORARY_HEADER);

    const tempHeaderColumnIndex = this.getColumnIndex(
      CUSTOM_ORDER_TEMPORARY_HEADER
    );
    this.sheet
      .getRange(
        this.headerRowIndex,
        tempHeaderColumnIndex + 1,
        this.sheet.getMaxRows() - this.headerRowIndex + 1
      )
      .clearContent();
    this.sync();
  }

  public sort(header: string, ascending: boolean = true) {
    const sortColumnIndex = this.getColumnIndex(header);
    const sortColumn = sortColumnIndex + 1;

    const range = this.sheet.getRange(
      this.headerRowIndex + 1,
      1,
      this.sheet.getMaxRows() - this.headerRowIndex,
      this.sheet.getMaxColumns()
    );

    range.sort({ column: sortColumn, ascending });
    this.sync();
  }

  public addId(id: string) {
    if (this.sheet.getMaxRows() == this.headerRowIndex + this.getIds().length) {
      this.sheet.insertRowAfter(this.sheet.getMaxRows());
      this.sync();
    }

    const lastRowIndex = this.headerRowIndex + this.getIds().length;
    const idColumnIndex = this.getColumnIndex(this.idHeader);
    this.values[lastRowIndex][idColumnIndex] = id;
  }

  public setDropdown(id: string, header: string, choices: string[]) {
    const columnIndex = this.getColumnIndex(header);
    const rowIndex = this.getRowIndex(id);
    const range = this.sheet.getRange(rowIndex + 1, columnIndex + 1);
    const rule = SpreadsheetApp.newDataValidation().requireValueInList(choices);
    range.setDataValidation(rule);
  }

  public setIds(ids: string[]) {
    if (ids.length > this.sheet.getMaxRows() - this.headerRowIndex) {
      const difference =
        ids.length - (this.sheet.getMaxRows() - this.headerRowIndex);
      this.sheet.insertRowsAfter(this.sheet.getMaxRows(), difference);
      this.sync();
    }

    const idColumnIndex = this.getColumnIndex(this.idHeader);
    for (let i = 0; i < ids.length; i++) {
      this.values[this.headerRowIndex + i][idColumnIndex] = ids[i];
    }
  }

  public setHeaders(headers: string[], newHeaderRowIndex: number) {
    this.headerRowIndex = newHeaderRowIndex;
    const headerRow = this.values[this.headerRowIndex - 1];
    for (let i = 0; i < headers.length; i++) {
      headerRow[i] = headers[i];
    }
  }

  public clearContents() {
    this.sheet.clearContents();
    this.sync();
  }

  public clearDataValidations() {
    const range = this.sheet.getRange(
      1,
      1,
      this.sheet.getMaxRows(),
      this.sheet.getMaxColumns()
    );
    range.clearDataValidations();
  }

  public getIds() {
    const values = this.getValues();
    const idColumnIndex = this.getColumnIndex(this.idHeader);
    const ids = values
      .map((row) => row[idColumnIndex])
      .slice(this.headerRowIndex)
      .filter((v) => v != "" && v != undefined);
    return ids;
  }

  public paint() {
    // This means that there has been no change in values.
    if (!this.range || !this.values) return;

    this.range.setValues(this.values);
    SpreadsheetApp.flush();
    this.sync();
  }

  public setValue(id: string, header: string, value: string | number) {
    if (this.getColumnIndex(header) < 0) {
      // There is no header in the table. Should make new one.
      if (this.getHeaderRow().length == this.sheet.getMaxColumns()) {
        this.sheet.insertColumnAfter(this.sheet.getMaxColumns());
        this.paint();
        this.sync();
      }

      const headerRow = this.getHeaderRow();
      const headerRowWithValues = headerRow.filter(
        (v) => v != "" && v != undefined
      );
      const newHeaderColumnIndex = headerRowWithValues.length;
      headerRow[newHeaderColumnIndex] = header;

      this.paint();
    }

    const columnIndex = this.getColumnIndex(header);
    const rowIndex = this.getRowIndex(id);
    const values = this.getValues();
    values[rowIndex][columnIndex] = value;
  }

  public getValue(id: string, header: string): string {
    const columnIndex = this.getColumnIndex(header);
    const rowIndex = this.getRowIndex(id);
    const value = this.getValues()[rowIndex][columnIndex];
    return value;
  }

  private getRowIndex(id: string) {
    const values = this.getValues();
    const idColumnIndex = this.getColumnIndex(this.idHeader);
    const rowIndex = values.findIndex((row) => row[idColumnIndex] == id);
    return rowIndex;
  }

  private getHeaderRow() {
    const values = this.getValues();
    const headerRow = values[this.headerRowIndex - 1];
    return headerRow;
  }

  private getColumnIndex(header: string): number {
    const headerRow = this.getHeaderRow();
    const columnIndex = headerRow.findIndex((h) => h == header);
    return columnIndex;
  }

  private getValues() {
    if (!this.range || !this.values) {
      this.sync();
    }
    return this.values;
  }

  private sync() {
    this.range = this.sheet.getRange(
      1,
      1,
      this.sheet.getMaxRows(),
      this.sheet.getMaxColumns()
    );
    if (!this.range) throw ` Error`;
    this.values = this.range.getDisplayValues();
  }
}
