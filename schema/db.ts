type Gender = "남" | "여";
type Classroom = "도약반" | "인터반" | "정규반" | "실전반";
type Category = "SAT" | "TOEFL";

const StudentTableSchema: TableSchema<Student> = {
  id: {
    header: "ID",
    verifier: VERIFIER.TEXT,
  },
  category: {
    header: "유형",
    verifier: VERIFIER.CATEGORY,
  },
  name: {
    header: "이름",
    verifier: VERIFIER.TEXT,
  },
  age: {
    header: "나이",
    verifier: VERIFIER.NUMBER,
  },
  gender: {
    header: "성별",
    verifier: VERIFIER.GENDER,
  },
  classroom: {
    header: "반",
    verifier: VERIFIER.TEXT,
  },
  parentEmail: {
    header: "부모님 이메일",
    verifier: VERIFIER.EMAIL,
  },
};

type WordTestScore = {
  id: string;
  name: string;
  date: string;
  score: number;
};

const WordTestScoreTableSchema: TableSchema<WordTestScore> = {
  id: {
    header: "ID",
    verifier: VERIFIER.TEXT,
  },
  name: {
    header: "이름",
    verifier: VERIFIER.TEXT,
  },
  date: {
    header: "날짜",
    verifier: VERIFIER.TEXT,
  },
  score: {
    header: "점수",
    verifier: VERIFIER.NUMBER,
  },
};

type Attendance = {
  name: string;
  date: string;
  period: string;
  attendance: number;
};

const DBAttendanceTableSchema: TableSchema<Attendance> = {
  name: {
    header: "이름",
    verifier: VERIFIER.TEXT,
  },
  date: {
    header: "날짜",
    verifier: VERIFIER.TEXT,
  },
  period: {
    header: "교시",
    verifier: VERIFIER.TEXT,
  },
  attendance: {
    header: "출석",
    verifier: VERIFIER.TEXT,
  },
};
