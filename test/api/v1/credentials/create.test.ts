import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";
import Credentials from "../../../../database/models/credentials";

describe("POST /api/v1/credentials", () => {
	const server = agent(webServer(routes));
	const email = `example-${Date.now()}@test.com`;
	let id;

	before(async () => container.resolve<App>("App").ready);

	it("Should create credentials", async () => {
		const { statusCode, body } = await server.post("/v1/credentials").send({
			orgId: 1,
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
		assert.equal(body.region, "us");
		assert.equal(body.provider, "local");
		assert.equal(body.providerType, "email");
		assert.equal(body.providerId, email);
		assert.equal(body.password, undefined);
		assert.equal(body.status, "verification");
		assert.isUndefined(body.password);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.isString(body.arn);
		assert.isBoolean(body.hasPassword);
		id = body.id;
	});

	it("Should return error if providerIs is already taken", async () => {
		const { statusCode, body } = await server.post("/v1/credentials").send({
			orgId: 1,
			region: "us",
			accountId: 1,
			provider: "local",
			providerId: email,
			status: "verification",
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
	});

	it("Should return created credentials", async () => {
		const { statusCode, body } = await server.get(`/v1/credentials/${id}`);
		assert.equal(statusCode, 200);
		assert.equal(body.orgId, 1);
		assert.equal(body.accountId, 1);
		assert.equal(body.region, "us");
		assert.equal(body.provider, "local");
		assert.equal(body.providerType, "email");
		assert.equal(body.providerId, email);
		assert.equal(body.password, undefined);
		assert.equal(body.status, "verification");
		assert.isUndefined(body.password);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.isString(body.arn);
		assert.isBoolean(body.hasPassword);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.post("/v1/credentials").send({
			orgId: -1,
			region: "u",
			accountId: -1,
			provider: "locale",
			providerType: "test",
			providerId: false,
			status: 0,
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.orgId[0]);
		assert.isString(body.validation.body.region[0]);
		assert.isString(body.validation.body.accountId[0]);
		assert.isString(body.validation.body.provider[0]);
		assert.isString(body.validation.body.providerType[0]);
		assert.isString(body.validation.body.providerId[0]);
		assert.isString(body.validation.body.status[0]);
	});
});
