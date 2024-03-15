import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";
import Credentials from "../../../../database/models/credentials";

describe("GET /api/v1/credentials/:credentialsId", () => {
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
			providerId: email,
			status: "verification",
		});
		assert.equal(statusCode, 201);
		assert.equal(body.orgId, 1);
		assert.equal(body.accountId, 1);
		assert.equal(body.region, "us");
		assert.equal(body.provider, "local");
		assert.equal(body.providerId, email);
		assert.equal(body.password, undefined);
		assert.equal(body.status, "verification");
		assert.isUndefined(body.password);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.isString(body.arn);
		id = body.id;
	});

	it("Should return created credentials", async () => {
		const { statusCode, body } = await server.get(`/v1/credentials/${id}`);
		assert.equal(statusCode, 200);
		assert.equal(body.orgId, 1);
		assert.equal(body.accountId, 1);
		assert.equal(body.region, "us");
		assert.equal(body.provider, "local");
		assert.equal(body.providerId, email);
		assert.equal(body.password, undefined);
		assert.equal(body.status, "verification");
		assert.isUndefined(body.password);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.isString(body.arn);
	});
});
