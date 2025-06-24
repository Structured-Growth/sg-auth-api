import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";
import Credentials from "../../../../database/models/credentials";

describe("GET /api/v1/otps/:otpId", () => {
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

	it("Should return created OTP", async () => {
		const { statusCode, body } = await server.get(`/v1/otps/${id}`);
		assert.equal(statusCode, 200);
		assert.equal(body.orgId, 1);
		assert.equal(body.region, "us");
		assert.equal(body.providerId, email);
		assert.equal(body.providerType, "email");
		assert.equal(body.code, undefined);
		assert.equal(body.lifeTime, 10);
		assert.equal(body.status, "active");
		assert.isUndefined(body.code);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.isString(body.arn);
	});
});
