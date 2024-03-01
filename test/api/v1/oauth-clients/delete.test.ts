import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";
import OAuthClient from "../../../../database/models/oauth-client";

describe("DELETE /api/v1/oauth-clients/:oauthClientId", () => {
	const server = agent(webServer(routes));
	let id;

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
			status: "inactive",
		});
		assert.equal(statusCode, 201);
		id = body.id;
	});

	it("Should delete oauth client", async () => {
		const { statusCode, body } = await server.delete(`/v1/oauth-clients/${id}`);
		assert.equal(statusCode, 204);
	});

	it("Should return not found error", async () => {
		const { statusCode, body } = await server.get(`/v1/oauth-clients/${id}`);
		assert.equal(statusCode, 404);
	});
});
