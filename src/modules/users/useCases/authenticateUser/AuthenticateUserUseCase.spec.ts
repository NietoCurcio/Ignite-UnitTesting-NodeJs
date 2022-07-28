import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: IUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );

    await createUserUseCase.execute({
      name: "test",
      email: "email@test.com",
      password: "123",
    });
  });

  it("should authenticate a user", async () => {
    const auth = await authenticateUserUseCase.execute({
      email: "email@test.com",
      password: "123",
    });

    expect(auth).toHaveProperty("token");
    expect(auth.token.length).toBeGreaterThan(0);
    expect(auth.user).toHaveProperty("id");
  });

  it("should not authenticate a non-existent user", () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "email@test2.com",
        password: "123",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not authenticate a user with incorrect password", () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "email@test.com",
        password: "1234",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
