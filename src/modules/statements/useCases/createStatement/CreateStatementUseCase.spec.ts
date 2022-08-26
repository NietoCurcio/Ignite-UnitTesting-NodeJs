import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { OperationType } from "./ICreateStatementDTO";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;

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
      sender_id: null,
    });

    expect(deposit).toHaveProperty("id");
    expect(deposit.type).toEqual("deposit");

    const withdraw = await createStatementUseCase.execute({
      amount: 100,
      description: "statement description",
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      sender_id: null,
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
        sender_id: null,
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
        sender_id: null,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it("should create a transfer statement", async () => {
    const user = await inMemoryUsersRepository.create({
      email: "email@test.com",
      name: "test",
      password: "123",
    });

    await createStatementUseCase.execute({
      amount: 100,
      description: "statement description",
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      sender_id: null,
    });

    const user2 = await inMemoryUsersRepository.create({
      email: "email2@test.com",
      name: "test2",
      password: "123",
    });

    const transfer = await createStatementUseCase.execute({
      amount: 50,
      description: "statement description",
      user_id: user2.id as string,
      type: OperationType.TRANSFER,
      sender_id: user.id!,
    });

    expect(transfer).toHaveProperty("id");
    expect(transfer.type).toEqual("transfer");
  });
});
