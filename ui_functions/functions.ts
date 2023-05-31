const attendanceSheetFormat = [
  {
    className: "도약반",
    columns: ["이름", "반", "1교시", "2교시"],
  },
  {
    className: "향상반",
    columns: ["이름", "반", "1교시", "2교시"],
  },
  {
    className: "정규반",
    columns: ["이름", "반", "1교시", "2교시"],
  },
];

const attendanceValues = ["출석", "결석", "기타", "병결"];

function resetTeacherAttendanceSheet() {
  const studentTable = getStudentTable();
  const students = studentTable.getAll();

  for (let format of attendanceSheetFormat) {
    const targetStudents = students.filter(
      (student) => student.classroom == format.className
    );
    const studentNames = targetStudents.map((student) => student.name);

    const attendanceDataGrid = new DataGrid(
      getTeacherSpreadsheet(),
      `${format.className} 출석`,
      format.columns,
      "이름"
    );

    attendanceDataGrid.reset();
    attendanceDataGrid.setIdColumns(studentNames);

    for (let student of targetStudents) {
      for (let column of format.columns) {
        switch (column) {
          case "이름":
            break;
          case "반":
            attendanceDataGrid.setValue(
              student.name,
              column,
              student.classroom
            );
            break;
          default:
            attendanceDataGrid.setDropdown(
              student.name,
              column,
              attendanceValues
            );
        }
      }
    }

    attendanceDataGrid.paint();
  }
}

function getAttendanceListFromTeacherSheet() {
  const attendanceList: Attendance[] = [];
  for (let format of attendanceSheetFormat) {
    const attendanceDataGrid = new DataGrid(
      getTeacherSpreadsheet(),
      `${format.className} 출석`,
      format.columns,
      "이름"
    );

    const studentNames = attendanceDataGrid
      .getIdColumns()
      .slice(1)
      .filter(hasValues);

    for (let name of studentNames) {
      for (let column of format.columns) {
        switch (column) {
          case "이름":
          case "반":
            break;
          default:
            const state = attendanceDataGrid.getValue(name, column);
            const attendance: Attendance = {
              name: name,
              date: getTodayDate(),
              period: column,
              attendance: state,
            };
            attendanceList.push(attendance);
        }
      }
    }
  }
  return attendanceList;
}

function updateAttendance() {
  const attendanceList = getAttendanceListFromTeacherSheet();
  const attendanceTable = getAttendanceTable();
  attendanceTable.insertBatch(attendanceList);
}

function getTodayDate() {
  const dateObj = new Date();
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const date = dateObj.getDate();
  return `${year}년 ${month}월 ${date}일`;
}
