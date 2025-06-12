import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";
import Credentials from "../../../../database/models/credentials";

describe("GET /api/v1/otps", () => {
	const server = agent(webServer(routes));
	const email = `example-${Date.now()}@test.com`;

	before(async () => container.resolve<App>("App").ready);

	it("Should create OTP", async () => {
		const { statusCode, body } = await server.post("/v1/otps").send({
			orgId: 1,
			region: "us",
			providerId: email,
			credentialId: 25,
			code: "123456",
			lifeTime: 10,
			status: "active",
		});
		assert.equal(statusCode, 201);
		assert.equal(body.orgId, 1);
	});

	it("Should return OTPs", async () => {
		const { statusCode, body } = await server.get("/v1/otps").query({
			orgId: 1,
			providerId: email,
			credentialId: 25,
			"status[0]": ["active"],
		});
		assert.equal(statusCode, 200);
		assert.isArray(body.data);
		assert.isNumber(body.data[0].id);
		assert.equal(body.data[0].orgId, 1);
		assert.equal(body.data[0].region, "us");
		assert.equal(body.data[0].providerId, email);
		assert.equal(body.data[0].credentialId, 25);
		assert.equal(body.data[0].status, "active");
		assert.isString(body.data[0].createdAt);
		assert.isString(body.data[0].updatedAt);
		assert.isString(body.data[0].arn);
		assert.equal(body.total, 1);
		assert.equal(body.page, 1);
		assert.equal(body.limit, 20);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.get("/v1/otps").query({
			orgId: -1,
			providerId: "",
			credentialId: -1,
			status: "test",
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.query.orgId[0]);
		assert.isString(body.validation.query.providerId[0]);
		assert.isString(body.validation.query.credentialId[0]);
		assert.isString(body.validation.query.status[0]);
	});
});
