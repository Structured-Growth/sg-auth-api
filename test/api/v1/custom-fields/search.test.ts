import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";

describe("GET /api/v1/custom-fields", () => {
	const { server, context } = initTest();
	const orgId = Math.floor(Math.random() * 1000000) + 1;

	it("Should create custom field", async () => {
		const { statusCode, body } = await server.post("/v1/custom-fields").send({
			orgId,
			region: "us",
			entity: "Credentials",
			title: "External Ref",
			name: "externalRef",
			schema: { type: "string" },
			status: "active",
		});

		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		context.customFieldId = body.id;
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.get("/v1/custom-fields").query({
			orgId: "a",
			id: -1,
			arn: 1,
			page: "b",
			limit: false,
			sort: "createdAt:asc",
			"entity[0]": "VeryLongEntityName".repeat(30),
			"status[0]": "superactive",
			"title[0]": "VeryLongTitle".repeat(30),
			"name[0]": "VeryLongName".repeat(30),
		});

		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.query.id[0]);
		assert.isString(body.validation.query.orgId[0]);
		assert.isString(body.validation.query.arn[0]);
		assert.isString(body.validation.query.entity[0][0]);
		assert.isString(body.validation.query.status[0][0]);
		assert.isString(body.validation.query.title[0][0]);
		assert.isString(body.validation.query.name[0][0]);
	});

	it("Should return custom field", async () => {
		const { statusCode, body } = await server.get("/v1/custom-fields").query({
			orgId,
			"id[0]": context.customFieldId,
			"entity[0]": "Credentials",
			"title[0]": "External*",
			"name[0]": "externalRef",
			"status[0]": "active",
		});

		assert.equal(statusCode, 200);
		assert.equal(body.total, 1);
		assert.equal(body.data[0].id, context.customFieldId);
		assert.equal(body.data[0].orgId, orgId);
		assert.equal(body.data[0].region, "us");
		assert.equal(body.data[0].entity, "Credentials");
		assert.equal(body.data[0].title, "External Ref");
		assert.equal(body.data[0].name, "externalRef");
		assert.equal(body.data[0].schema.type, "string");
		assert.equal(body.data[0].status, "active");
		assert.isString(body.data[0].arn);
		assert.equal(body.page, 1);
		assert.equal(body.limit, 20);
	});
});
