export enum CalType {
  GOOGLE = "google",
  MICROSOFT = "microsoft",
  APPLE = "apple",
  ICS = "ICS"
};

export const EmptyCalendar: Calendar = { _id: '-1', name: "", accessIdentifier: null, type: null };
export class Calendar {
  _id: string;
  name: string;
  accessIdentifier: any;
  type: CalType;
  static EmptyCalendar: Calendar;
};