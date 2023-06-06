type Student = {
  id: string;
  category: string;
  name: string;
  classroom: string;
  grade: string;
  gender: string;
  parent_email: string;
};

function getStudents() {
  const dbSpreadsheet = SpreadsheetApp.openById(DB_SHEET_ID);
  const sheet = dbSpreadsheet.getSheetByName("학생");
  const table = new Table(sheet, "이름", 1);
  const names = table.getIds();
  const students: Student[] = [];

  for (const name of names) {
    students.push({
      id: table.getValue(name, "ID"),
      category: table.getValue(name, "유형"),
      name: name,
      classroom: table.getValue(name, "반"),
      grade: table.getValue(name, "학년"),
      gender: table.getValue(name, "성별"),
      parent_email: table.getValue(name, "부모님 이메일"),
    });
  }

  return students;
}

function getTodayDateString() {
  const today = new Date(Date.now());
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();

  return `${month}월 ${date}일`;
  //   return `${year}년 ${month}월 ${date}일`;
}

function basicSort(table: Table) {
  table.sort("이름");
  table.customSort("반", ["도약반", "인터반", "정규반", "실전반"]);
  table.customSort("유형", ["TOEFL", "SAT"]);
}

function basicColor(table: Table) {
  const COLORS = {
    RED: "#f4cccc",
    ORANGE: "#fce5cd",
    YELLOW: "#fff2cc",
    GREEN: "#d9ead3",
    BLUE: "#c9daf8",
    PURPLE: "#d9d2e9",
  };
  const names = table.getIds();
  for (const name of names) {
    const classroom = table.getValue(name, "반");
    if (table.getValue(name, "유형") == "TOEFL") {
      switch (classroom) {
        case "도약반":
          table.colorRow(name, COLORS.RED);
          break;
        case "인터반":
          table.colorRow(name, COLORS.ORANGE);
          break;
        case "정규반":
          table.colorRow(name, COLORS.YELLOW);
          break;
        case "실전반":
          table.colorRow(name, COLORS.GREEN);
          break;
      }
    } else if (table.getValue(name, "유형") == "SAT") {
      switch (classroom) {
        case "정규반":
          table.colorRow(name, COLORS.BLUE);
          break;
        case "실전반":
          table.colorRow(name, COLORS.PURPLE);
          break;
      }
    }
  }
}
