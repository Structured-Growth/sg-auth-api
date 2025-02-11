import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";

describe("GET /api/v1/permitted-organizations", () => {
	const { server, context } = initTest();
	const randomOrgId = Math.floor(Math.random() * 10000);
	const randomAccountId = Math.floor(Math.random() * 10000);

	it("Should create permitted organization", async () => {
		const { statusCode, body } = await server.post("/v1/permitted-organizations").send({
			orgId: randomOrgId,
			region: "us",
			accountId: randomAccountId,
			status: "active",
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.equal(body.status, "active");
		context.permittedOrganizationId = body.id;
	});

	it("Should return 0 account", async () => {
		const { statusCode, body } = await server.get("/v1/permitted-organizations").query({
			orgId: 999999,
		});
		assert.equal(statusCode, 200);
	});

	it("Should return account", async () => {
		const { statusCode, body } = await server.get("/v1/permitted-organizations").query({
			"id[0]": context.permittedOrganizationId,
			orgId: randomOrgId,
			"accountId[0]": randomAccountId,
			"status[0]": "active",
		});

		assert.equal(statusCode, 200);
		assert.equal(body.data[0].id, context.permittedOrganizationId);
		assert.equal(body.data[0].orgId, randomOrgId);
		assert.equal(body.data[0].accountId, randomAccountId);
		assert.isNotNaN(new Date(body.data[0].createdAt).getTime());
		assert.isNotNaN(new Date(body.data[0].updatedAt).getTime());
		assert.isString(body.data[0].status);
		assert.isString(body.data[0].arn);
		assert.equal(body.page, 1);
		assert.equal(body.limit, 20);
		assert.equal(body.total, 1);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.get("/v1/permitted-organizations").query({
			id: -1,
			orgId: "a",
			accountId: "b",
			page: 0,
			limit: false,
			sort: "createdAt:asc",
			status: "deleted",
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.query.id[0]);
		assert.isString(body.validation.query.orgId[0]);
		assert.isString(body.validation.query.accountId[0]);
		assert.isString(body.validation.query.status[0]);
	});
});
