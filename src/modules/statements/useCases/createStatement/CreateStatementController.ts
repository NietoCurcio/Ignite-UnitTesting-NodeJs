import { Request, Response } from "express";
import { container } from "tsyringe";

import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { OperationType } from "./ICreateStatementDTO";

export class CreateStatementController {
  async execute(request: Request, response: Response) {
    const { id: user_id } = request.user;
    const { amount, description } = request.body;

    const { userId } = request.params;

    const splittedPath = request.originalUrl.split("/");

    const type = userId
      ? splittedPath[splittedPath.length - 2]
      : splittedPath[splittedPath.length - 1];

    const createStatement = container.resolve(CreateStatementUseCase);

    const statement = await createStatement.execute({
      user_id: userId ? userId : user_id,
      type: type as OperationType,
      amount,
      description,
      sender_id: userId ? user_id : null,
    });

    return response.status(201).json(statement);
  }
}
