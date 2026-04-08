import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";
import { seedCustomField } from "../../../common/seed-custom-fields";

describe("GET /api/v1/otps", () => {
	const server = agent(webServer(routes));
	const orgId = 1;
	const email = `example-${Date.now()}@test.com`;
	let credentialId: number;

	before(async () => container.resolve<App>("App").ready);
	beforeEach(() => seedCustomField(orgId, "OTP"));

	it("Should create credentials", async () => {
		const { statusCode, body } = await server.post("/v1/credentials").send({
			orgId,
			region: "us",
			accountId: 1,
			provider: "local",
			providerType: "email",
			providerId: email,
			status: "verification",
		});
		assert.equal(statusCode, 201);
		assert.equal(body.orgId, 1);
		assert.equal(body.accountId, 1);
		credentialId = body.id;
	});

	it("Should create OTP", async () => {
		const { statusCode, body } = await server.post("/v1/otps").send({
			orgId,
			region: "us",
			providerId: email,
			providerType: "email",
			credentialId,
			code: "123456",
			lifeTime: 10,
			metadata: {
				externalRef: "OTP-21",
			},
			status: "active",
		});
		assert.equal(statusCode, 201);
		assert.equal(body.orgId, orgId);
	});

	it("Should return OTPs", async () => {
		const { statusCode, body } = await server.get("/v1/otps").query({
			orgId,
			providerId: email,
			providerType: "email",
			credentialId,
			metadata: {
				externalRef: "OTP-21",
			},
			"status[0]": ["active"],
		});
		assert.equal(statusCode, 200);
		assert.isArray(body.data);
		assert.isNumber(body.data[0].id);
		assert.equal(body.data[0].orgId, orgId);
		assert.equal(body.data[0].region, "us");
		assert.equal(body.data[0].providerId, email);
		assert.equal(body.data[0].providerType, "email");
		assert.equal(body.data[0].credentialId, credentialId);
		assert.equal(body.data[0].status, "active");
		assert.equal(body.data[0].metadata.externalRef, "OTP-21");
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
			providerType: "test",
			credentialId: -1,
			status: "test",
			metadata: "bad",
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.query.orgId[0]);
		assert.isString(body.validation.query.providerId[0]);
		assert.isString(body.validation.query.providerType[0]);
		assert.isString(body.validation.query.credentialId[0]);
		assert.isString(body.validation.query.status[0]);
		assert.isString(body.validation.query.metadata[0]);
	});
});
