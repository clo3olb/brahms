type ClassManagementPanelSchema = {
  category: string;
  classroom: string;
  timeslots: string[];
};

const managerPanelSchema_ES: ClassManagementPanelSchema[] = [
  {
    category: "TOEFL",
    classroom: "도약반",
    timeslots: [
      "1교시",
      "2교시",
      "3교시",
      "4교시",
      "GS1",
      "GS2",
      "TP1",
      "TP2",
      "자습1",
      "자습2",
      "자습3",
    ],
  },
  {
    category: "TOEFL",
    classroom: "인터반",
    timeslots: [
      "1교시",
      "2교시",
      "3교시",
      "4교시",
      "GS1",
      "GS2",
      "TP1",
      "TP2",
      "자습1",
      "자습2",
      "자습3",
    ],
  },
  {
    category: "TOEFL",
    classroom: "정규반",
    timeslots: [
      "1교시",
      "2교시",
      "3교시",
      "4교시",
      "GS1",
      "GS2",
      "TP1",
      "TP2",
      "자습1",
      "자습2",
      "자습3",
    ],
  },
  {
    category: "TOEFL",
    classroom: "실전반",
    timeslots: [
      "1교시",
      "2교시",
      "3교시",
      "4교시",
      "GS1",
      "GS2",
      "TP1",
      "TP2",
      "자습1",
      "자습2",
      "자습3",
    ],
  },
  {
    category: "Math",
    classroom: "Algebra 2",
    timeslots: ["자습1", "자습2"],
  },
  {
    category: "Math",
    classroom: "Geometry",
    timeslots: ["자습1", "자습2"],
  },
];
const managerPanelSchema_US: ClassManagementPanelSchema[] = [
  {
    category: "TOEFL",
    classroom: "정규반",
    timeslots: [
      "1교시",
      "2교시",
      "3교시",
      "4교시",
      "GS1",
      "GS2",
      "TP1",
      "TP2",
      "자습1",
      "자습2",
      "자습3",
    ],
  },
  {
    category: "TOEFL",
    classroom: "실전반",
    timeslots: [
      "1교시",
      "2교시",
      "3교시",
      "4교시",
      "GS1",
      "GS2",
      "TP1",
      "TP2",
      "자습1",
      "자습2",
      "자습3",
    ],
  },
];

const attendanceChoices = ["출석", "결석", "병결", "기타"];
