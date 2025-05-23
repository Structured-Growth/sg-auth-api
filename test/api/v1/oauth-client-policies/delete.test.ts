import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";

describe("DELETE /api/v1/oauth-client-policies/:oauthClientPolicyId", () => {
	const server = agent(webServer(routes));
	let id;

	before(async () => container.resolve<App>("App").ready);

	it("Should create oauth-client-policy", async () => {
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

	it("Should delete oauth client policy", async () => {
		const { statusCode, body } = await server.delete(`/v1/oauth-client-policies/${id}`);
		assert.equal(statusCode, 204);
	});

	it("Should return not found error", async () => {
		const { statusCode, body } = await server.get(`/v1/oauth-client-policies/${id}`);
		assert.equal(statusCode, 404);
	});
});
