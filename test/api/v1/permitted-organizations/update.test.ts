import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { seedCustomField } from "../../../common/seed-custom-fields";

describe("PUT /api/v1/permitted-organizations/:permittedOrganizationId", () => {
	const { server, context } = initTest();
	const randomOrgId = Math.floor(Math.random() * 10000);
	const randomAccountId = Math.floor(Math.random() * 10000);
	beforeEach(() => seedCustomField(randomOrgId, "PermittedOrganization"));

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
				metadata: {
					externalRef: "PO-11",
				},
			});
		assert.equal(statusCode, 200);
		assert.isNumber(body.id);
		assert.equal(body.orgId, randomOrgId);
		assert.equal(body.accountId, randomAccountId);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.equal(body.status, "inactive");
		assert.equal(body.metadata.externalRef, "PO-11");
		assert.isString(body.arn);
	});

	it("Should return updated permitted organization", async () => {
		const { statusCode, body } = await server.get(`/v1/permitted-organizations/${context.permittedOrganizationId}`);
		assert.equal(statusCode, 200);
		assert.equal(body.id, context.permittedOrganizationId);
		assert.equal(body.status, "inactive");
		assert.equal(body.metadata.externalRef, "PO-11");
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server
			.put(`/v1/permitted-organizations/${context.permittedOrganizationId}`)
			.send({
				status: "deleted",
				metadata: "bad",
			});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.body.status[0]);
		assert.isString(body.validation.body.metadata[0]);
	});

	it("Should return custom fields validation error", async () => {
		const { statusCode, body } = await server
			.put(`/v1/permitted-organizations/${context.permittedOrganizationId}`)
			.send({
				metadata: {
					externalRef: "P",
				},
			});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.metadata.externalRef[0]);
	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.put(`/v1/permitted-organizations/9999`);
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});
});
