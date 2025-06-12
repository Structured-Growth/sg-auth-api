import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";
import Credentials from "../../../../database/models/credentials";

describe("POST /api/v1/otps", () => {
	const server = agent(webServer(routes));
	const email = `example-${Date.now()}@test.com`;
	let id;

	before(async () => container.resolve<App>("App").ready);

	it("Should create OTP", async () => {
		const { statusCode, body } = await server.post("/v1/otps").send({
			orgId: 1,
			region: "us",
			providerId: email,
			code: "123456",
			lifeTime: 10,
			status: "active",
		});
		assert.equal(statusCode, 201);
		assert.equal(body.orgId, 1);
		assert.equal(body.region, "us");
		assert.equal(body.providerId, email);
		assert.equal(body.code, undefined);
		assert.equal(body.lifeTime, 10);
		assert.equal(body.status, "active");
		assert.isUndefined(body.code);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.isString(body.arn);
		id = body.id;
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.post("/v1/otps").send({
			orgId: -1,
			region: "usa",
			providerId: -1,
			code: false,
			lifeTime: "test",
			status: 0,
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.orgId[0]);
		assert.isString(body.validation.body.region[0]);
		assert.isString(body.validation.body.providerId[0]);
		assert.isString(body.validation.body.code[0]);
		assert.isString(body.validation.body.lifeTime[0]);
		assert.isString(body.validation.body.status[0]);
	});

	it("Should archive previous OTPs with the same providerId and orgId", async () => {
		const firstRes = await server.post("/v1/otps").send({
			orgId: 2,
			region: "us",
			providerId: email,
			code: "000000",
			lifeTime: 5,
			status: "active",
		});
		assert.equal(firstRes.statusCode, 201);
		const firstOtpId = firstRes.body.id;

		const secondRes = await server.post("/v1/otps").send({
			orgId: 2,
			region: "us",
			providerId: email,
			code: "111111",
			lifeTime: 5,
			status: "active",
		});
		assert.equal(secondRes.statusCode, 201);

		const readRes = await server.get(`/v1/otps/${firstOtpId}`);
		assert.equal(readRes.statusCode, 200);
		assert.equal(readRes.body.status, "archived");
	});
});
