import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";

describe("POST /api/v1/oauth-client-policies", () => {
	const server = agent(webServer(routes));
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
		assert.equal(body.oauthClientId, oauthClientId);
		assert.equal(body.region, "us");
		assert.equal(body.providerType, "email");
		assert.isBoolean(body.passwordRequired);
		assert.isBoolean(body.twoFaEnabled);
		assert.equal(body.status, "active");
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.isString(body.arn);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.post("/v1/oauth-clients").send({
			orgId: -1,
			region: "n",
			oauthClientId: -1,
			providerType: 1,
			passwordRequired: 21,
			twoFaEnabled: 22,
			status: "activated",
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.orgId[0]);
		assert.isString(body.validation.body.region[0]);
		assert.isString(body.validation.body.oauthClientId[0]);
		assert.isString(body.validation.body.providerType[0]);
		assert.isString(body.validation.body.passwordRequired[0]);
		assert.isString(body.validation.body.twoFaEnabled[0]);
		assert.isString(body.validation.body.status[0]);
	});
});
