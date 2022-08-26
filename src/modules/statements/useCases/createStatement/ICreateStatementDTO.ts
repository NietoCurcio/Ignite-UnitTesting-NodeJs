export enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

export interface ICreateStatementDTO {
  user_id: string;
  description: string;
  amount: number;
  type: OperationType;
  sender_id: string | null;
}
