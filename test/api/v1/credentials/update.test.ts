import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";
import { seedCustomField } from "../../../common/seed-custom-fields";

describe("PUT /api/v1/credentials/:credentialsId", () => {
	const server = agent(webServer(routes));
	const orgId = 1;
	const email = `example-${Date.now()}@test.com`;
	let id;
	let clientId;
	let clientSecret;

	before(async () => container.resolve<App>("App").ready);
	beforeEach(() => seedCustomField(orgId, "Credentials"));

	it("Should create credentials", async () => {
		const { statusCode, body } = await server.post("/v1/credentials").send({
			orgId,
			region: "us",
			accountId: 1,
			provider: "local",
			providerType: "email",
			providerId: email,
			password: "Fld2ZaW4sV@?6k)A",
			metadata: {
				externalRef: "AA-20",
			},
			status: "inactive",
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.equal(body.status, "inactive");
		id = body.id;
		clientId = body.clientId;
		clientSecret = body.clientSecret;
	});

	it("Should update credentials", async () => {
		const { statusCode, body } = await server.put(`/v1/credentials/${id}`).send({
			status: "active",
			providerType: "phoneNumber",
			otpId: 25,
			metadata: {
				externalRef: "AA-21",
			},
		});
		assert.equal(statusCode, 200);
		assert.equal(body.status, "active");
		assert.equal(body.providerType, "phoneNumber");
		assert.equal(body.otpId, 25);
		assert.equal(body.metadata.externalRef, "AA-21");
	});

	it("Should return updated credentials", async () => {
		const { statusCode, body } = await server.get(`/v1/credentials/${id}`);
		assert.equal(statusCode, 200);
		assert.equal(body.status, "active");
		assert.equal(body.providerType, "phoneNumber");
		assert.equal(body.clientId, clientId);
		assert.equal(body.clientSecret, clientSecret);
		assert.equal(body.otpId, 25);
		assert.equal(body.metadata.externalRef, "AA-21");
		assert.isBoolean(body.hasPassword);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.put(`/v1/credentials/${id}`).send({
			providerType: "test",
			status: "bad",
			otpId: "bad",
			metadata: "bad",
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.providerType[0]);
		assert.isString(body.validation.body.status[0]);
		assert.isString(body.validation.body.otpId[0]);
		assert.isString(body.validation.body.metadata[0]);
	});

	it("Should return custom fields validation error", async () => {
		const { statusCode, body } = await server.put(`/v1/credentials/${id}`).send({
			metadata: {
				externalRef: "A",
			},
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.metadata.externalRef[0]);
	});
});
