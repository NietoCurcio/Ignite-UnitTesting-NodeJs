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

  it("should get a statement operation", async () => {
    const { body } = await request(app).post("/api/v1/sessions").send({
      email: "test@gmail.com",
      password: "123",
    });

    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "deposit description",
      })
      .set({ Authorization: `Bearer ${body.token}` });

    const response = await request(app)
      .get(`/api/v1/statements/${deposit.body.id}`)
      .set({
        Authorization: `Bearer ${body.token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("should not get a statement from another user", async () => {
    const user1Response = await request(app).post("/api/v1/sessions").send({
      email: "test@gmail.com",
      password: "123",
    });

    const user2Response = await request(app).post("/api/v1/sessions").send({
      email: "test2@gmail.com",
      password: "123",
    });

    const deposit2 = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "deposit description",
      })
      .set({ Authorization: `Bearer ${user2Response.body.token}` });

    const response = await request(app)
      .get(`/api/v1/statements/${deposit2.body.id}`)
      .set({
        Authorization: `Bearer ${user1Response.body.token}`,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Statement not found");
  });
});
