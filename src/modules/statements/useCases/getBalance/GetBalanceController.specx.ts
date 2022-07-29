import { app } from "../../../../app";
import request from "supertest";
import getConnection from "../../../../database";
import { Connection } from "typeorm";

let connection: Connection;
describe("Get Balance Controller", () => {
  beforeAll(async () => {
    connection = await getConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send({
      name: "test",
      email: "test@gmail.com",
      password: "123",
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should get balance and all statements from a user", async () => {
    const { body } = await request(app).post("/api/v1/sessions").send({
      email: "test@gmail.com",
      password: "123",
    });

    const response1 = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${body.token}`,
      });

    expect(response1.status).toBe(200);
    expect(response1.body.balance).toBe(0);
    expect(response1.body.statement.length).toBe(0);

    let balance = 0;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "deposit description",
      })
      .set({ Authorization: `Bearer ${body.token}` });

    balance += 100;

    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 90,
        description: "withdraw description",
      })
      .set({ Authorization: `Bearer ${body.token}` });

    const response2 = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${body.token}`,
      });

    balance += -90;

    expect(response2.status).toBe(200);
    expect(response2.body.balance).toBe(balance);
    expect(response2.body.statement.length).toBe(2);
  });

  it("should not get balance from a invalid authorization", async () => {
    const response = await request(app).get("/api/v1/statements/balance").set({
      Authorization: `Bearer someInvalidToken123`,
    });

    expect(response.status).toBe(401);
  });
});
