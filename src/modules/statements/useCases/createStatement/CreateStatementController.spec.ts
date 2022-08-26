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

    await request(app).post("/api/v1/users").send({
      name: "test2",
      email: "test2@gmail.com",
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

  it("should create a transfer statement", async () => {
    const {
      body: { token: user1token },
    } = await request(app).post("/api/v1/sessions").send({
      email: "test@gmail.com",
      password: "123",
    });

    const {
      body: { user: user2 },
    } = await request(app).post("/api/v1/sessions").send({
      email: "test2@gmail.com",
      password: "123",
    });

    const response = await request(app)
      .post(`/api/v1/statements/transfer/${user2.id}`)
      .send({
        amount: 50,
        description: "Transfer description",
      })
      .set({ Authorization: `Bearer ${user1token}` });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.type).toBe("transfer");
  });

  it("should update the sender and recipient balance after transference", async () => {
    const {
      body: { token: user1token },
    } = await request(app).post("/api/v1/sessions").send({
      email: "test@gmail.com",
      password: "123",
    });

    const {
      body: { user: user2, token: user2token },
    } = await request(app).post("/api/v1/sessions").send({
      email: "test2@gmail.com",
      password: "123",
    });

    await request(app)
      .post(`/api/v1/statements/transfer/${user2.id}`)
      .send({
        amount: 20,
        description: "Transfer description",
      })
      .set({ Authorization: `Bearer ${user1token}` });

    const response1 = await request(app)
      .get("/api/v1/statements/balance")
      .set({ Authorization: `Bearer ${user1token}` });

    const response2 = await request(app)
      .get("/api/v1/statements/balance")
      .set({ Authorization: `Bearer ${user2token}` });

    expect(response1.body.balance).toBe(30);
    expect(response2.body.balance).toBe(70);
  });
});
