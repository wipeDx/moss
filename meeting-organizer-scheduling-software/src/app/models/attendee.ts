export enum Priority {
  MOST_IMPORTANT = "MOST_IMPORTANT",
  NORMAL = "NORMAL",
  NOT_IMPORTANT = "NOT_IMPORTANT"
}
export enum AnswerState { 
  YES = "YES",
  NO = "NO",
  NONE = "NONE"
}

export class Attendee {
  _id: string;
  userID: any;
  priority: Priority = Priority.NORMAL;
  answerState: AnswerState = AnswerState.NONE;
  customAnswer: string = "";
}