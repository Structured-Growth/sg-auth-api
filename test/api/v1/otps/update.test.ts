import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";
import Credentials from "../../../../database/models/credentials";

describe("PUT /api/v1/otps/:otpId", () => {
	const server = agent(webServer(routes));
	const email = `example-${Date.now()}@test.com`;
	let id;

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
		id = body.id;
	});

	it("Should update OTP", async () => {
		const { statusCode, body } = await server.put(`/v1/otps/${id}`).send({
			status: "archived",
		});
		assert.equal(statusCode, 200);
	});

	it("Should return updated credentials", async () => {
		const { statusCode, body } = await server.get(`/v1/otps/${id}`);
		assert.equal(statusCode, 200);
		assert.equal(body.status, "archived");
	});
});
