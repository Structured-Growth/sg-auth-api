import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";

describe("GET /api/v1/permitted-organizations/:permittedOrganizationId", () => {
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

	it("Should read permitted organization", async () => {
		const { statusCode, body } = await server
			.get(`/v1/permitted-organizations/${context.permittedOrganizationId}`)
			.send({});
		assert.equal(statusCode, 200);
		assert.equal(body.id, context.permittedOrganizationId);
		assert.equal(body.orgId, randomOrgId);
		assert.equal(body.accountId, randomAccountId);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.equal(body.status, "active");
		assert.isString(body.arn);
	});

	it("Should return is permitted organization does not exist", async () => {
		const { statusCode, body } = await server.get(`/v1/permitted-organizations/999999`);
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.get(`/v1/permitted-organizations/mainaccount`);
		assert.equal(statusCode, 422);
		assert.isString(body.message);
	});
});
