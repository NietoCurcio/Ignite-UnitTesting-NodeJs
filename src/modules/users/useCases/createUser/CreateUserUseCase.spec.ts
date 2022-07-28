import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let inMemoryUsersRepository: IUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should create a user", async () => {
    const user = await createUserUseCase.execute({
      name: "Test name",
      email: "email@test.com",
      password: "123",
    });

    expect(user).toHaveProperty("id");
  });

  it("should not create a user with same email", () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "Test name",
        email: "email@test.com",
        password: "123",
      });

      await createUserUseCase.execute({
        name: "Test name2",
        email: "email@test.com",
        password: "1234",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
