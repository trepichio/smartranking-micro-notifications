export interface IChallenge {
  _id: string;
  dateTimeChallenge: Date;
  dateTimeRequest: Date;
  dateTimeReply?: Date;
  requester: string;
  category: string;
  match?: string;
  players: string[];
}
