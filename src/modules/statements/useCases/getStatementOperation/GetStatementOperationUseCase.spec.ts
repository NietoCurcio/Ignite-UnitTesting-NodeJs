import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { OperationType } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should get a statement operation", async () => {
    const user = await inMemoryUsersRepository.create({
      email: "email@test.com",
      name: "test",
      password: "123",
    });

    const deposit = await createStatementUseCase.execute({
      amount: 100,
      description: "statement description",
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      sender_id: null,
    });

    const operation = await getStatementOperationUseCase.execute({
      statement_id: deposit.id as string,
      user_id: user.id as string,
    });

    expect(operation.id).toBe(deposit.id);
    expect(operation.user_id).toBe(user.id);
  });

  it("should not get a statement from non-existent user", () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        statement_id: "deposit.id",
        user_id: "user.id",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not get a statement from another user", () => {
    expect(async () => {
      const user1 = await inMemoryUsersRepository.create({
        email: "email@test.com",
        name: "test",
        password: "123",
      });
      const user2 = await inMemoryUsersRepository.create({
        email: "email@test2.com",
        name: "test2",
        password: "123",
      });
      const deposit2 = await createStatementUseCase.execute({
        amount: 100,
        description: "statement description2",
        user_id: user2.id as string,
        type: OperationType.DEPOSIT,
        sender_id: null,
      });

      await getStatementOperationUseCase.execute({
        statement_id: deposit2.id as string,
        user_id: user1.id as string,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
