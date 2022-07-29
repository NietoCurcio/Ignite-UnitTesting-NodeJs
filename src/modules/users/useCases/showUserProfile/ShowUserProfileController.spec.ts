import { app } from "../../../../app";
import request from "supertest";
import getConnection from "../../../../database";
import { Connection } from "typeorm";

let connection: Connection;
describe("Show User Profile Controller", () => {
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

  it("should get user profile given a valid token", async () => {
    const { body } = await request(app).post("/api/v1/sessions").send({
      email: "test@gmail.com",
      password: "123",
    });

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${body.token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("should not get user profile given an invalid token", async () => {
    const response = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer someInvalidToken123`,
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("JWT invalid token!");
  });
});
