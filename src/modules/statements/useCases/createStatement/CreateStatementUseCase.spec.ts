import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should create statement", async () => {
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
    });

    expect(deposit).toHaveProperty("id");
    expect(deposit.type).toEqual("deposit");

    const withdraw = await createStatementUseCase.execute({
      amount: 100,
      description: "statement description",
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
    });

    expect(withdraw).toHaveProperty("id");
    expect(withdraw.type).toEqual("withdraw");
  });

  it("should not create statement for non-existent user", () => {
    expect(async () => {
      await createStatementUseCase.execute({
        amount: 100,
        description: "statement description",
        user_id: "userId",
        type: OperationType.DEPOSIT,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not withdraw with insufficient funds", () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        email: "email@test.com",
        name: "test",
        password: "123",
      });

      await createStatementUseCase.execute({
        amount: 100,
        description: "statement description",
        user_id: user.id as string,
        type: OperationType.WITHDRAW,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
