import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";
import OAuthClient from "../../../../database/models/oauth-client";

describe("GET /api/v1/oauth-clients/:oauthClientId", () => {
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
			status: "active",
		});
		assert.equal(statusCode, 201);
		id = body.id;
	});

	it("Should return created oauth-client without clientSecret", async () => {
		const { statusCode, body } = await server.get(`/v1/oauth-clients/${id}`);
		assert.equal(statusCode, 200);
		assert.equal(body.id, id);
		assert.equal(body.orgId, 1);
		assert.equal(body.accountId, 1);
		assert.equal(body.region, "us");
		assert.equal(body.title, "Test client");
		assert.isString(body.clientId);
		assert.isUndefined(body.clientSecret);
		assert.equal(body.status, "active");
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.isString(body.arn);
	});
});
