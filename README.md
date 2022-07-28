# Unit Testing with Jest <img src="https://iconape.com/wp-content/png_logo_vector/jest-logo.png" alt="Jest" width="25px">

> Jest is a Javascript test runner

The configuration of Jest is done through the `jest.config.ts`, `jest.setup.ts` and `tsconfig.ts` when working with Typescript files.

## Users module

### Unit tests for user creation use case.

- should create a user
- should not create a user with the same email

### Unit tests for user authentication use case.

- should authenticate a user
- should not authenticate a non-existent user
- should not authenticate a user with an incorrect password

### Unit tests for listing profile use case

- should get user profile given a valid id
- should not get user profile given an invalid id

## Statements module

### Unit tests for statement creation use case.

- should create a statement
- should not create statement for a non-existent user
- should not withdraw with insufficient funds.

### Unit tests for statement creation use case.

- should get balance and all statements from a user
- should not get balance from a non-existent user

### Unit tests for listing statement operation use case.

- should get a statement of operation
- should not get a statement of non-existent user
- should not get a statement of another user
