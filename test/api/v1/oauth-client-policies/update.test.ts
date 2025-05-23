import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";
import OAuthClient from "../../../../database/models/oauth-client";

describe("PUT /api/v1/oauth-client-policies/:oauthClientPolicyId", () => {
	const server = agent(webServer(routes));
	let id;

	before(async () => container.resolve<App>("App").ready);

	it("Should create oauth-clients-policy", async () => {
		const { statusCode, body } = await server.post("/v1/oauth-client-policies").send({
			orgId: 1,
			region: "us",
			oauthClientId: 1,
			providerType: "email",
			passwordRequired: true,
			twoFaEnabled: true,
			status: "active",
		});
		assert.equal(statusCode, 201);
		id = body.id;
	});

	it("Should update oauth-clients-policy", async () => {
		const { statusCode, body } = await server.put(`/v1/oauth-client-policies/${id}`).send({
			status: "inactive",
			providerType: "phoneNumber",
			passwordRequired: false,
			twoFaEnabled: false,
		});
		assert.equal(statusCode, 200);
		assert.equal(body.id, id);
		assert.equal(body.status, "inactive");
		assert.equal(body.providerType, "phoneNumber");
		assert.equal(body.passwordRequired, false);
		assert.equal(body.twoFaEnabled, false);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.put(`/v1/oauth-client-policies/${id}`).send({
			status: "activated",
			providerType: 1,
			passwordRequired: 2,
			twoFaEnabled: 3,
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.status[0]);
		assert.isString(body.validation.body.providerType[0]);
		assert.isString(body.validation.body.passwordRequired[0]);
		assert.isString(body.validation.body.twoFaEnabled[0]);
	});
});
