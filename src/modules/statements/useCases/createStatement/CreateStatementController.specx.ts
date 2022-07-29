import { app } from "../../../../app";
import request from "supertest";
import getConnection from "../../../../database";
import { Connection } from "typeorm";

let connection: Connection;
describe("Create Statement Controller", () => {
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

  it("should create a deposit statement", async () => {
    const { body } = await request(app).post("/api/v1/sessions").send({
      email: "test@gmail.com",
      password: "123",
    });

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "deposit description",
      })
      .set({ Authorization: `Bearer ${body.token}` });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.type).toBe("deposit");
  });

  it("should create a withdraw statement", async () => {
    const { body } = await request(app).post("/api/v1/sessions").send({
      email: "test@gmail.com",
      password: "123",
    });

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "withdraw description",
      })
      .set({ Authorization: `Bearer ${body.token}` });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.type).toBe("withdraw");
  });

  it("should not create statement with invalid authorization", async () => {
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "withdraw description",
      })
      .set({ Authorization: `Bearer someInvalidToken123` });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("JWT invalid token!");
  });

  it("should not withdraw with insufficient funds", async () => {
    const { body } = await request(app).post("/api/v1/sessions").send({
      email: "test@gmail.com",
      password: "123",
    });

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "deposit description",
      })
      .set({ Authorization: `Bearer ${body.token}` });

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 110,
        description: "withdraw description",
      })
      .set({ Authorization: `Bearer ${body.token}` });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Insufficient funds");
  });
});
