class MessageSender {
  private appKey: string;
  private secretKey: string;
  private sendNumber: string;
  private userId: string;
  private logTable: Table;

  constructor(
    appKey: string,
    secretKey: string,
    sendNumber: string,
    userId: string,
    logTable: Table
  ) {
    this.appKey = appKey;
    this.secretKey = secretKey;
    this.sendNumber = sendNumber;
    this.userId = userId;
    this.logTable = logTable;
  }

  send(message: string, phoneNumber: string, tag?: string) {
    const url = this.getMessageAPIURL();
    const payload = {
      body: message,
      sendNo: this.sendNumber,
      recipientList: [
        {
          recipientNo: phoneNumber,
          countryCode: "82",
        },
      ],
      userId: this.userId,
      statsId: tag,
      originCode: "123456789",
    };

    this.log(message, phoneNumber, true);

    // const response = UrlFetchApp.fetch(url, {
    //   method: "post",
    //   contentType: "application/json;charset=UTF-8",
    //   headers: {
    //     "X-Secret-Key": this.secretKey,
    //   },
    //   payload: JSON.stringify(payload),
    // });
  }

  private getMessageAPIURL(): string {
    const BASE_URL = "https://api-sms.cloud.toast.com";
    const PATH = `/sms/v3.0/appKeys/${this.appKey}/sender/sms`;

    return `${BASE_URL}${PATH}`;
  }

  private log(message: string, phoneNumber: string, success: boolean) {
    const successState = success ? "성공" : "실패";
    const messageId = createUUID();
    this.logTable.addId(messageId);
    this.logTable.setValue(messageId, "타임스탬프", new Date().toUTCString());
    this.logTable.setValue(messageId, "메세지", message);
    this.logTable.setValue(messageId, "부모님 전화번호", phoneNumber);
    this.logTable.setValue(messageId, "결과", successState);
    this.logTable.paint();
  }
}

function sendWordTestScoreMessage(
  dbSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet
) {
  const today = getTodayDateString();

  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    "알림",
    `${today} 단어시험 결과를 문자로 발송하시겠습니까?`,
    ui.ButtonSet.OK_CANCEL
  );
  if (response != ui.Button.OK) return;

  const students = getStudents(dbSpreadsheet);
  const wordTestScoreTable = getDBWordTestTable(dbSpreadsheet);
  const messageTemplateTable = getDBMessageTemplateTable(dbSpreadsheet);
  const messageLogTable = getDBMessageLogTable(dbSpreadsheet);

  const wordTestScoreMessageTemplate = messageTemplateTable.getValue(
    "단어시험",
    "템플릿"
  );
  const messageSender = new MessageSender(
    "RANDOM_STRING",
    "RANDOM_STRING",
    "RANDOM_STRING",
    "RANDOM_STRING",
    messageLogTable
  );

  for (const student of students) {
    const score = wordTestScoreTable.getValue(student.name, today);
    const message = createMessageFromTemplate(
      wordTestScoreMessageTemplate,
      student,
      { score: score }
    );
    messageSender.send(message, student.parentPhoneNumber);
    Logger.log(message);
  }
}
