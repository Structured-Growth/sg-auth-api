import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";

describe("GET /api/v1/credentials", () => {
	const server = agent(webServer(routes));

	before(async () => container.resolve<App>("App").ready);

	it("Should return credentials", async () => {
		const { statusCode, body } = await server.get("/v1/credentials").query({
			orgId: 1,
			accountId: 1,
			provider: "local",
			providerId: "example@test.com",
			"status[0]": ["active"],
			"status[1]": ["inactive"],
		});
		assert.equal(statusCode, 200);
		assert.isArray(body.data);
		assert.equal(body.total, 0);
		assert.equal(body.page, 1);
		assert.equal(body.limit, 20);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.get("/v1/credentials").query({
			orgId: -1,
			region: "notus",
			accountId: -1,
			provider: "localize",
			providerId: 1,
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
