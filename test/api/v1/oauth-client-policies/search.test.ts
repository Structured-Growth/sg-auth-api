import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";
import OAuthClient from "../../../../database/models/oauth-client";

describe("GET /api/v1/oauth-client-policies", () => {
	const server = agent(webServer(routes));
	const context: Record<any, any> = {};
	let oauthClientId: number;

	before(async () => container.resolve<App>("App").ready);

	it("Should create oauth-clients", async () => {
		const { statusCode, body } = await server.post("/v1/oauth-clients").send({
			orgId: 25,
			region: "us",
			accountId: 1,
			title: "Test client",
			status: "active",
			defaultOrgName: "test",
			grants: ["authorization_code", "refresh_token"],
			redirectUris: ["http://localhost:3001/api/auth/callback/oauth"],
		});
		assert.equal(statusCode, 201);
		assert.equal(body.orgId, 25);

		oauthClientId = body.id;
	});

	it("Should create oauth-client-policy", async () => {
		const { statusCode, body } = await server.post("/v1/oauth-client-policies").send({
			orgId: 1,
			region: "us",
			oauthClientId,
			providerType: "email",
			passwordRequired: true,
			twoFaEnabled: true,
			status: "active",
		});
		assert.equal(statusCode, 201);
		assert.equal(body.orgId, 1);
		context.client = body;
	});

	it("Should search ", async () => {
		const { statusCode, body } = await server.get("/v1/oauth-client-policies").query({
			orgId: 1,
			oauthClientId: context.client.oauthClientId,
			providerType: context.client.providerType,
			"status[]": "active",
		});
		assert.equal(statusCode, 200);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.get("/v1/oauth-client-policies").query({
			orgId: -1,
			oauthClientId: "",
			status: "active",
			providerType: -1,
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.query.orgId[0]);
		assert.isString(body.validation.query.oauthClientId[0]);
		assert.isString(body.validation.query.providerType[0]);
		assert.isString(body.validation.query.status[0]);
	});
});
