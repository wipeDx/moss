export enum Color { NORMAL, BUSY, OWN_BUSY, CHANGED }

export const EmptyTimeslot: Timeslot = { title: '', start: new Date(), end: new Date(), bgcolor: Color.NORMAL, id: -1, extendedProps: { hashID: "" }}
export class Timeslot {
  title: string;
  start: Date;
  end: Date;
  bgcolor?: Color = Color.NORMAL;
  id?: number;
  extendedProps: { hashID: string };
}