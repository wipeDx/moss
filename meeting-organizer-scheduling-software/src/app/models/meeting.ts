import { Timeslot } from './timeslot';
import { Attendee } from './attendee';
import { User, EmptyUser } from './user';
import { TranslateService } from '@ngx-translate/core';

export enum Interval {
  WEEK = "WEEK",
  DAY = "DAY",
  YEAR = "YEAR",
  NONE = "NONE",
  MONTH = "MONTH"
};
export enum State {
  PENDING_ANSWERS = "PendingAnswers",
  PENDING_NEW_DATE = "PendingNewDate",
  CANCELLED = "Cancelled",
  COMPLETED = "Completed"
}

function friendlyInterval(interval: Interval, multiple: boolean): string {
  switch (interval) {
    case Interval.WEEK:
      return multiple ? "weeks" : "week";
    case Interval.DAY:
      return multiple ? "days" : "day";
    case Interval.YEAR:
      return multiple ? "years" : "year";
    case Interval.MONTH:
      return multiple ? "months" : "month";
    case Interval.NONE:
      return "";
  }
}

export { friendlyInterval as friendlyIntervalFunction }

export const EmptyMeeting: Meeting = {
  name: '',
  comment: '',
  location: '',
  timeslots: [],
  repeating: false,
  repeatingCount: -1,
  repeatingInterval: Interval.NONE,
  state: State.PENDING_ANSWERS,
  created: new Date(),
  attendees: [],
  creator: EmptyUser,
}

export class Meeting {
  _id?: string;
  name: string;
  comment: string;
  location: string;
  timeslots: Timeslot[];
  repeating: boolean;
  repeatingCount: number;
  repeatingInterval: Interval = Interval.NONE;
  state: State = State.PENDING_ANSWERS;
  created: Date;
  attendees: Attendee[];
  creator: any;
}