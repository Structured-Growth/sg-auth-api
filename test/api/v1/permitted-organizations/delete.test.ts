import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";

describe("DELETE /api/v1/permitted-organizations/:permittedOrganizationsId", () => {
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

	it("Should delete permitted organization", async () => {
		const { statusCode, body } = await server.delete(`/v1/permitted-organizations/${context.permittedOrganizationId}`);
		assert.equal(statusCode, 204);
	});

	it("Should return is permitted organization does not exist and delete was successful", async () => {
		const { statusCode, body } = await server.delete(`/v1/permitted-organizations/${context.permittedOrganizationId}`);
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.delete(`/v1/permitted-organizations/mainaccount`);
		assert.equal(statusCode, 422);
		assert.isString(body.message);
	});
});
