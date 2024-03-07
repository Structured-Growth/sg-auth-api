import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";
import OAuthClient from "../../../../database/models/oauth-client";

describe("GET /api/v1/oauth-clients", () => {
	const server = agent(webServer(routes));
	const context: Record<any, any> = {};

	before(async () => {
		await container.resolve<App>("App").ready;
		await OAuthClient.truncate({ restartIdentity: true });
	});

	it("Should create oauth-clients", async () => {
		const { statusCode, body } = await server.post("/v1/oauth-clients").send({
			orgId: 1,
			region: "us",
			accountId: 1,
			title: "Test client",
			status: "active",
			defaultOrgName: "test",
			grants: ["authorization_code", "refresh_token"],
			redirectUris: ["http://localhost:3001/api/auth/callback/oauth"],
		});
		assert.equal(statusCode, 201);
		assert.equal(body.orgId, 1);
		assert.equal(body.accountId, 1);
		assert.equal(body.region, "us");
		assert.equal(body.title, "Test client");
		assert.isString(body.clientId);
		assert.isString(body.clientSecret);
		assert.equal(body.status, "active");
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.isString(body.arn);
		context.client = body;
	});

	it("Should return oauth-clients", async () => {
		const { statusCode, body } = await server.get("/v1/oauth-clients").query({
			// orgId: 1,
			clientId: context.client.clientId,
			"status[0]": ["active"],
		});
		assert.equal(statusCode, 200);
		assert.isArray(body.data);
		assert.isNumber(body.data[0].id);
		assert.equal(body.data[0].orgId, 1);
		assert.equal(body.data[0].region, "us");
		assert.equal(body.data[0].accountId, 1);
		assert.equal(body.data[0].title, "Test client");
		assert.equal(body.data[0].clientId, context.client.clientId);
		assert.isUndefined(body.data[0].clientSecret);
		assert.equal(body.data[0].status, "active");
		assert.isString(body.data[0].createdAt);
		assert.isString(body.data[0].updatedAt);
		assert.isString(body.data[0].arn);
		assert.isString(body.data[0].defaultOrgName);
		assert.isString(body.data[0].grants[0]);
		assert.isString(body.data[0].redirectUris[0]);
		assert.equal(body.total, 1);
		assert.equal(body.page, 1);
		assert.equal(body.limit, 20);
	});

	it("Should search by title with wildcard", async () => {
		const { statusCode, body } = await server.get("/v1/oauth-clients").query({
			orgId: 1,
			"title[0]": "*est*",
			"title[1]": "*client",
		});
		assert.equal(statusCode, 200);
		assert.equal(body.total, 1);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.get("/v1/oauth-clients").query({
			orgId: -1,
			region: "notus",
			accountId: -1,
			title: 1,
			status: "active",
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.query.orgId[0]);
		assert.isString(body.validation.query.region[0]);
		assert.isString(body.validation.query.accountId[0]);
		assert.isString(body.validation.query.title[0]);
		assert.isString(body.validation.query.status[0]);
	});
});
