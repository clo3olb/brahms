type Attendance = {
  name: string;
  classroom: string;
  attendance: string;
};

const AttendanceTableSchema: TableSchema<Attendance> = {
  name: {
    header: "이름",
    verifier: VERIFIER.TEXT,
  },
  classroom: {
    header: "반",
    verifier: VERIFIER.TEXT,
  },
  attendance: {
    header: "출석",
    verifier: VERIFIER.TEXT,
  },
};
