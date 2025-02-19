import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";
import Credentials from "../../../../database/models/credentials";

describe("GET /api/v1/credentials", () => {
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
			status: "active",
		});
		assert.equal(statusCode, 201);
		assert.equal(body.orgId, 1);
		assert.equal(body.accountId, 1);
		assert.isUndefined(body.password);
	});

	it("Should return credentials", async () => {
		const { statusCode, body } = await server.get("/v1/credentials").query({
			orgId: 1,
			"accountId[0]": 1,
			provider: "local",
			providerId: email,
			"status[0]": ["active"],
			"status[1]": ["inactive"],
		});
		assert.equal(statusCode, 200);
		assert.isArray(body.data);
		assert.isNumber(body.data[0].id);
		assert.equal(body.data[0].orgId, 1);
		assert.equal(body.data[0].region, "us");
		assert.equal(body.data[0].accountId, 1);
		assert.equal(body.data[0].provider, "local");
		assert.equal(body.data[0].providerId, email);
		assert.equal(body.data[0].status, "active");
		assert.isUndefined(body.data[0].password);
		assert.isString(body.data[0].createdAt);
		assert.isString(body.data[0].updatedAt);
		assert.isString(body.data[0].arn);
		assert.equal(body.total, 1);
		assert.equal(body.page, 1);
		assert.equal(body.limit, 20);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.get("/v1/credentials").query({
			orgId: -1,
			region: "notus",
			accountId: -1,
			provider: "localize",
			providerId: "",
			status: "active",
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.query.orgId[0]);
		assert.isString(body.validation.query.region[0]);
		assert.isString(body.validation.query.accountId[0]);
		assert.isString(body.validation.query.provider[0]);
		assert.isString(body.validation.query.providerId[0]);
		assert.isString(body.validation.query.status[0]);
	});
});
