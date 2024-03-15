import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";
import Credentials from "../../../../database/models/credentials";

describe("PUT /api/v1/credentials", () => {
	const server = agent(webServer(routes));
	const email = `example-${Date.now()}@test.com`;

	before(async () => container.resolve<App>("App").ready);

	it("Should create credentials", async () => {
		const { statusCode, body } = await server.post("/v1/credentials").send({
			orgId: 1,
			region: "us",
			accountId: 1,
			provider: "local",
			providerId: email,
			password: "Fld2ZaW4sV@?6k)A",
			status: "active",
		});
		assert.equal(statusCode, 201);
		assert.equal(body.orgId, 1);
		assert.equal(body.accountId, 1);
		assert.isUndefined(body.password);
	});

	it("Should check if credentials are valid", async () => {
		const { statusCode, body } = await server.put("/v1/credentials").send({
			orgId: 1,
			provider: "local",
			providerId: email,
			password: "Fld2ZaW4sV@?6k)A",
		});
		assert.equal(statusCode, 200);
		assert.equal(body.orgId, 1);
		assert.equal(body.accountId, 1);
		assert.equal(body.region, "us");
		assert.equal(body.provider, "local");
		assert.equal(body.providerId, email);
		assert.equal(body.password, undefined);
		assert.equal(body.status, "active");
		assert.isUndefined(body.password);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.isString(body.arn);
	});

	it("Should return error if password is invalid", async () => {
		const { statusCode, body } = await server.put("/v1/credentials").send({
			orgId: 1,
			provider: "local",
			providerId: email,
			password: "Fld2ZaW4sV@?6k)A---",
		});
		assert.equal(statusCode, 422);
		assert.isString(body.message);
	});
});
