import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile", () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("should get user profile given a valid id", async () => {
    await createUserUseCase.execute({
      name: "test",
      email: "email@test.com",
      password: "123",
    });

    const { user } = await authenticateUserUseCase.execute({
      email: "email@test.com",
      password: "123",
    });

    const profile = await showUserProfileUseCase.execute(user.id as string);

    expect(profile).toHaveProperty("id");
    expect(profile.email).toEqual("email@test.com");
  });

  it("should not get user profile given an invalid id", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("123");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
