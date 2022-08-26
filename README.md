# Unit Testing with Jest <img src="https://iconape.com/wp-content/png_logo_vector/jest-logo.png" alt="Jest" width="25px">

> Jest is a Javascript test runner

The configuration of Jest is done through the `jest.config.ts`, `jest.setup.ts` and `tsconfig.ts` when working with Typescript files.

The unit tests run using in-memory data so that the services for user creation are tested, for example. The Integration follows the complete process of sending a request and getting a response. It creates a database for testing instead of using only in-memory data. In that way, not only the service or the use case for user creation are tested, but the controller, the service and how the data is manipulated (DML) in the database through the repository.

## Users module

### Unit & Integration tests for user creation use case.

- should create a user
- should not create a user with the same email

### Unit & Integration tests for user authentication use case.

- should authenticate a user
- should not authenticate a non-existent user
- should not authenticate a user with an incorrect password

### Tests for listing profile use case

- Unit test

  - should get user profile given a valid id
  - should not get user profile given an invalid id

- Integration test

  - should get user profile given a valid token
  - should not get user profile given an invalid token

## Statements module

### Tests for statement creation use case.

- Unit test

  - should create a statement
  - should not create statement for a non-existent user
  - should not withdraw with insufficient funds

- Integration test

  - should create a deposit statement
  - should create a withdraw statement
  - should not create statement with invalid authorization
  - should not withdraw with insufficient funds

### Unit & Integration tests for get balance use case.

- should get balance and all statements from a user
- should not get balance from a non-existent user
- should not get balance from a invalid authorization

### Unit & Integration tests for listing a statement use case.

- should get a statement of operation
- should not get a statement of non-existent user
- should not get a statement of another user

## Running the tests:

```
$ npm run test
```

## Requirements engineering

### Functional requirements

| Id   | Name           | Actor    |
| ---- | -------------- | -------- |
| RF01 | Transfer money | Customer |

### Business rules

| Id   | Description                                                    | Functional Requirement |
| ---- | -------------------------------------------------------------- | ---------------------- |
| RN01 | It shouldn't transfer amounts greater than the account balance | RF01                   |
| RN01 | It should consider the transfers when getting the balance      | RF01                   |
