const DB_SHEET_NAMES = {
  STUDENT: "학생",
  WORD_TEST_SCORE: "단어시험",
  ATTENDANCE: "출석",
};

const COLUMN_HEADERS = {
  STUDENT: {
    ID: "ID",
    CATEGORY: "유형",
    NAME: "이름",
    CLASSROOM: "반",
    GENDER: "성별",
    AGE: "나이",
    PARENT_EMAIL: "부모님 이메일",
  },
};

type Student = {
  id: number;
  category: Category;
  name: string;
  classroom: Classroom;
  gender: Gender;
  age: number;
  parentEmail: string;
};

function getStudent(dataGrid: DataGridV2, name: string): Student {
  return {
    id: dataGrid.getValue(name, COLUMN_HEADERS.STUDENT.ID),
    category: dataGrid.getValue(name, COLUMN_HEADERS.STUDENT.CATEGORY),
    name: dataGrid.getValue(name, COLUMN_HEADERS.STUDENT.NAME),
    classroom: dataGrid.getValue(name, COLUMN_HEADERS.STUDENT.CLASSROOM),
    gender: dataGrid.getValue(name, COLUMN_HEADERS.STUDENT.GENDER),
    age: dataGrid.getValue(name, COLUMN_HEADERS.STUDENT.AGE),
    parentEmail: dataGrid.getValue(name, COLUMN_HEADERS.STUDENT.PARENT_EMAIL),
  };
}

function getAllStudents(dataGrid: DataGridV2) {
  const studentNames = dataGrid.getAllIds();
  const students: Student[] = [];
  for (const name of studentNames) {
    const student = getStudent(dataGrid, name);
    students.push(student);
  }
  return students;
}
