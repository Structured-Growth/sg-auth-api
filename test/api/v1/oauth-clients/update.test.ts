import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";
import OAuthClient from "../../../../database/models/oauth-client";

describe("PUT /api/v1/oauth-clients/:oauthClientId", () => {
	const server = agent(webServer(routes));
	let id;

	before(async () => container.resolve<App>("App").ready);

	it("Should create oauth-clients", async () => {
		const { statusCode, body } = await server.post("/v1/oauth-clients").send({
			orgId: 25,
			region: "us",
			accountId: 1,
			title: "Test client",
			status: "inactive",
			defaultOrgName: "test",
			grants: ["authorization_code", "refresh_token"],
			redirectUris: ["http://localhost:3001/api/auth/callback/oauth"],
		});
		assert.equal(statusCode, 201);
		assert.equal(body.status, "inactive");
		id = body.id;
	});

	it("Should update client status", async () => {
		const { statusCode, body } = await server.put(`/v1/oauth-clients/${id}`).send({
			status: "active",
		});
		assert.equal(statusCode, 200);
		assert.equal(body.id, id);
		assert.equal(body.status, "active");
		assert.isUndefined(body.clientSecret);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.put(`/v1/oauth-clients/${id}`).send({
			status: "activated",
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.status[0]);
	});
});
