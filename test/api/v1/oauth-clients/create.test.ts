import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";
import OAuthClient from "../../../../database/models/oauth-client";

describe("POST /api/v1/oauth-clients", () => {
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
		id = body.id;
	});

	it("Should return created oauth-client without clientSecret", async () => {
		const { statusCode, body } = await server.get(`/v1/oauth-clients/${id}`);
		assert.equal(statusCode, 200);
		assert.equal(body.id, id);
		assert.isUndefined(body.clientSecret);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.post("/v1/oauth-clients").send({
			orgId: -1,
			region: "notus",
			accountId: -1,
			title: 1,
			status: "activated",
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.orgId[0]);
		assert.isString(body.validation.body.region[0]);
		assert.isString(body.validation.body.accountId[0]);
		assert.isString(body.validation.body.title[0]);
		assert.isString(body.validation.body.status[0]);
	});
});
