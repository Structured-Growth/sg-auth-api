import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";
import Credentials from "../../../../database/models/credentials";

describe("PUT /api/v1/otps", () => {
	const server = agent(webServer(routes));
	const email = `example-${Date.now()}@test.com`;

	before(async () => container.resolve<App>("App").ready);

	it("Should create OTP", async () => {
		const { statusCode, body } = await server.post("/v1/otps").send({
			orgId: 1,
			region: "us",
			providerId: email,
			providerType: "email",
			code: "123456",
			lifeTime: 10,
			status: "active",
		});
		assert.equal(statusCode, 201);
		assert.equal(body.orgId, 1);
	});

	it("Should check if OTP are valid", async () => {
		const { statusCode, body } = await server.put("/v1/otps").send({
			orgId: 1,
			providerId: email,
			providerType: "email",
			code: "123456",
		});
		assert.equal(statusCode, 200);
		assert.equal(body.orgId, 1);
		assert.equal(body.region, "us");
		assert.equal(body.providerId, email);
		assert.equal(body.providerType, "email");
		assert.equal(body.code, undefined);
		assert.equal(body.lifeTime, 10);
		assert.equal(body.status, "archived");
		assert.isUndefined(body.code);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.isString(body.arn);
	});

	it("Should return error if code is invalid", async () => {
		const { statusCode, body } = await server.put("/v1/otps").send({
			orgId: 1,
			providerId: email,
			providerType: "test",
			code: "1234567",
		});
		assert.equal(statusCode, 422);
		assert.isString(body.message);
	});
});
