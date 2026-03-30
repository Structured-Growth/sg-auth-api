import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";
import Credentials from "../../../../database/models/credentials";
import { seedCustomField } from "../../../common/seed-custom-fields";

describe("GET /api/v1/credentials", () => {
	const server = agent(webServer(routes));
	const orgId = 1;
	const email = `example-${Date.now()}@test.com`;

	before(async () => container.resolve<App>("App").ready);
	beforeEach(() => seedCustomField(orgId, "Credentials"));

	it("Should create credentials", async () => {
		const { statusCode, body } = await server.post("/v1/credentials").send({
			orgId,
			region: "us",
			accountId: 1,
			provider: "local",
			providerType: "email",
			providerId: email,
			otpId: 25,
			status: "active",
			metadata: {
				externalRef: "AA-22",
			},
		});
		assert.equal(statusCode, 201);
		assert.equal(body.orgId, orgId);
		assert.equal(body.accountId, 1);
		assert.isUndefined(body.password);
	});

	it("Should return credentials", async () => {
		const { statusCode, body } = await server.get("/v1/credentials").query({
			orgId,
			"accountId[0]": 1,
			provider: "local",
			providerType: "email",
			providerId: email,
			metadata: JSON.stringify({ externalRef: "AA-22" }),
			"status[0]": ["active"],
			"status[1]": ["inactive"],
		});
		assert.equal(statusCode, 200);
		assert.isArray(body.data);
		assert.isNumber(body.data[0].id);
		assert.equal(body.data[0].orgId, orgId);
		assert.equal(body.data[0].region, "us");
		assert.equal(body.data[0].accountId, 1);
		assert.equal(body.data[0].provider, "local");
		assert.equal(body.data[0].providerType, "email");
		assert.equal(body.data[0].providerId, email);
		assert.equal(body.data[0].otpId, 25);
		assert.equal(body.data[0].status, "active");
		assert.isUndefined(body.data[0].password);
		assert.isString(body.data[0].createdAt);
		assert.isString(body.data[0].updatedAt);
		assert.isString(body.data[0].arn);
		assert.isBoolean(body.data[0].hasPassword);
		assert.equal(body.data[0].metadata.externalRef, "AA-22");
		assert.equal(body.total, 1);
		assert.equal(body.page, 1);
		assert.equal(body.limit, 20);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.get("/v1/credentials").query({
			orgId: -1,
			"accountId[0]": -1,
			provider: "localize",
			providerType: "",
			providerId: "",
			otpId: "text",
			"status[0]": "wrong",
			metadata: "x".repeat(2001),
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.query.orgId[0]);
		assert.isString(body.validation.query.accountId[0][0]);
		assert.isString(body.validation.query.provider[0]);
		assert.isString(body.validation.query.providerType[0]);
		assert.isString(body.validation.query.providerId[0]);
		assert.isString(body.validation.query.otpId[0]);
		assert.isString(body.validation.query.status[0][0]);
		assert.isString(body.validation.query.metadata[0]);
	});
});
