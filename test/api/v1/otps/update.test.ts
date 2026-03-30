import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";
import Credentials from "../../../../database/models/credentials";
import { seedCustomField } from "../../../common/seed-custom-fields";

describe("PUT /api/v1/otps/:otpId", () => {
	const server = agent(webServer(routes));
	const orgId = 1;
	const email = `example-${Date.now()}@test.com`;
	let id;

	before(async () => container.resolve<App>("App").ready);
	beforeEach(() => seedCustomField(orgId, "OTP"));

	it("Should create OTP", async () => {
		const { statusCode, body } = await server.post("/v1/otps").send({
			orgId,
			region: "us",
			providerId: email,
			providerType: "email",
			code: "123456",
			lifeTime: 10,
			status: "active",
			metadata: {
				externalRef: "OTP-10",
			},
		});
		assert.equal(statusCode, 201);
		assert.equal(body.orgId, orgId);
		id = body.id;
	});

	it("Should update OTP", async () => {
		const { statusCode, body } = await server.put(`/v1/otps/${id}`).send({
			status: "archived",
			metadata: {
				externalRef: "OTP-11",
			},
		});
		assert.equal(statusCode, 200);
		assert.equal(body.metadata.externalRef, "OTP-11");
	});

	it("Should return updated credentials", async () => {
		const { statusCode, body } = await server.get(`/v1/otps/${id}`);
		assert.equal(statusCode, 200);
		assert.equal(body.status, "archived");
		assert.equal(body.metadata.externalRef, "OTP-11");
	});
});
