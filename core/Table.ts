class Table<T> {
  spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet;
  sheet: GoogleAppsScript.Spreadsheet.Sheet;
  name: string;
  entity: Entity<T>;

  constructor(
    spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
    name: string,
    entity: Entity<T>
  ) {
    this.spreadsheet = spreadsheet;
    this.sheet = this.spreadsheet.getSheetByName(name);
    this.name = name;
    this.entity = entity;

    this.verify();
  }

  getAll(): T[] {
    const range = this.sheet.getRange(
      1,
      1,
      this.sheet.getMaxRows(),
      this.sheet.getMaxColumns()
    );

    const values = range.getValues();

    const columnHeaders = values[0];
    let rows = values.slice(1);
    rows = rows.filter(hasValues);

    const entities = [];
    for (let row of rows) {
      const entity = {};
      for (let i = 0; i < columnHeaders.length; i++) {
        const header = columnHeaders[i];
        if (!header) {
          continue;
        }
        const targetKey = Object.keys(this.entity).find(
          (key) => this.entity[key].name == header
        );
        entity[targetKey] = String(row[i]).trim();
      }
      if (Object.keys(entity).length > 0) {
        entities.push(entity);
      }
    }

    return entities as T[];
  }

  verify(): void {
    const data = this.getAll();
    for (let i = 0; i < data.length; i++) {
      const datum = data[i];
      const keys = Object.keys(datum);
      for (let key of keys) {
        try {
          this.entity[key].verify(datum[key]);
        } catch (error) {
          throw `Verification Error\nError Sheet: ${this.sheet.getName()}\nError Row: ${
            i + 2
          }\nError Message: ${error}`;
        }
      }
    }
  }

  createSheet(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet) {
    const sheet = spreadsheet.insertSheet(this.name);
    const columns = Object.keys(this.entity).map(
      (key) => this.entity[key].name
    );

    sheet.getRange(1, 1, 1, columns.length).setValues([columns]);
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
