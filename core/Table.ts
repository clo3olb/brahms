class Table<T> {
  spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet;
  sheet: GoogleAppsScript.Spreadsheet.Sheet;
  name: string;
  schema: TableSchema<T>;
  range: GoogleAppsScript.Spreadsheet.Range;
  values: any[][];

  constructor(
    spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
    name: string,
    schema: TableSchema<T>
  ) {
    this.spreadsheet = spreadsheet;
    this.sheet = this.spreadsheet.getSheetByName(name);
    this.name = name;
    this.schema = schema;

    this.verify();
  }

  insertBatch(dataList: T[]) {
    const headers = this.getHeaders();
    const rows = [];
    for (let datum of dataList) {
      const row = new Array(headers.length);
      for (let key of Object.keys(datum)) {
        const headerIndex = headers.findIndex(
          (v) => v == this.schema[key].header
        );
        row[headerIndex] = datum[key];
      }
      rows.push(row);
    }

    this.sheet.insertRowsBefore(2, rows.length);
    this.sheet
      .getRange(2, 1, rows.length, this.sheet.getMaxColumns())
      .setValues(rows);
  }

  insert(data: T) {
    const headers = this.getHeaders();
    const row = new Array(headers.length);
    for (let key of Object.keys(data)) {
      const headerIndex = headers.findIndex(
        (v) => v == this.schema[key].header
      );
      row[headerIndex] = data[key];
    }

    this.sheet.insertRowBefore(2);
    this.sheet.getRange(2, 1, 1, this.sheet.getMaxColumns()).setValues([row]);
  }

  getValuesWithHeader(): any[][] {
    if (!this.range) {
      this.range = this.sheet.getRange(
        1,
        1,
        this.sheet.getMaxRows(),
        this.sheet.getMaxColumns()
      );
    }
    if (!this.values) {
      this.values = this.range.getValues();
    }

    return this.values;
  }

  getHeaders(): any[] {
    return this.getValuesWithHeader()[0];
  }

  getSchemaHeaders(): string[] {
    const headers: string[] = [];
    for (let key of Object.keys(this.schema)) {
      const schema = this.schema[key] as Schema;
      headers.push(schema.header);
    }
    return headers;
  }

  getRows(): any[][] {
    return this.getValuesWithHeader().slice(1).filter(hasValues);
  }

  getAll(): T[] {
    const columnHeaders = this.getHeaders();
    const rows = this.getRows();

    const entities = [];
    for (let row of rows) {
      const entity = {};
      for (let i = 0; i < columnHeaders.length; i++) {
        const header = columnHeaders[i];
        if (!header) {
          continue;
        }
        const targetKey = Object.keys(this.schema).find(
          (key) => this.schema[key].header == header
        );
        entity[targetKey] = String(row[i]).trim();
      }
      if (Object.keys(entity).length > 0) {
        entities.push(entity);
      }
    }

    return entities as T[];
  }

  verifyHeaders() {
    const headers = this.getHeaders();
    const schemaHeaders = this.getSchemaHeaders();
    for (let header of schemaHeaders) {
      if (!headers.includes(header))
        throw `Verification Error - ${this.spreadsheet.getName()}\nCannot find ${header} from the sheet ${this.sheet.getName()}`;
    }
  }

  verify(): void {
    this.verifyHeaders();

    const data = this.getAll();
    for (let i = 0; i < data.length; i++) {
      const datum = data[i];
      const keys = Object.keys(datum);
      for (let key of keys) {
        try {
          this.schema[key].verifier(datum[key]);
        } catch (error) {
          throw `Verification Error - ${this.spreadsheet.getName()}\nError Sheet: ${this.sheet.getName()}\nError Row: ${
            i + 2
          }\nError Message: ${error}`;
        }
      }
    }
  }

  createSheet() {
    const columns = Object.keys(this.schema).map(
      (key) => this.schema[key].header
    );
    this.simplifyRows();

    this.sheet.getRange(1, 1, 1, columns.length).setValues([columns]);
  }

  100;

  simplifyRows() {
    this.sheet.deleteRows(10, this.sheet.getMaxRows() - 10);
  }

  resetSheet() {
    this.sheet.clearContents();
    this.simplifyRows();

    const columns = Object.keys(this.schema).map(
      (key) => this.schema[key].header
    );

    this.sheet.getRange(1, 1, 1, columns.length).setValues([columns]);
  }
}

function hasValues(list: any[]) {
  for (let item of list) {
    if (item != "") {
      return true;
    }
  }
  return false;
}
