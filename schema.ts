type Student = {
  id: number;
  name: string;
  age: number;
  parentEmail: string;
};

const StudentDataType: Entity<Student> = {
  id: new Data("ID"),
  name: new Data("이름"),
  age: new Data("나이", VERIFIER.NUMBER),
  parentEmail: new Data("부모님 이메일", VERIFIER.EMAIL),
};

type WordTestScore = {
  id: number;
  name: string;
  date: string;
  score: number;
};

const WordTestScoreDataType: Entity<WordTestScore> = {
  id: new Data("ID"),
  name: new Data("이름"),
  date: new Data("날짜"),
  score: new Data("점수", VERIFIER.NUMBER),
};
