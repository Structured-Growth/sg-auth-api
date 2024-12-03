import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";

describe("PUT /api/v1/permitted-organizations/:permittedOrganizationId", () => {
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

	it("Should update permitted organization", async () => {
		const { statusCode, body } = await server
			.put(`/v1/permitted-organizations/${context.permittedOrganizationId}`)
			.send({
				status: "inactive",
			});
		assert.equal(statusCode, 200);
		assert.isNumber(body.id);
		assert.equal(body.orgId, randomOrgId);
		assert.equal(body.accountId, randomAccountId);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.equal(body.status, "inactive");
		assert.isString(body.arn);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server
			.put(`/v1/permitted-organizations/${context.permittedOrganizationId}`)
			.send({
				status: "deleted",
			});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.body.status[0]);
	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.put(`/v1/permitted-organizations/9999`);
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});
});
