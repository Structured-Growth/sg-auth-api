import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";
import { seedCustomField } from "../../../common/seed-custom-fields";

describe("PUT /api/v1/oauth-clients/:oauthClientId", () => {
	const server = agent(webServer(routes));
	const orgId = 25;
	let id;

	before(async () => container.resolve<App>("App").ready);
	beforeEach(() => seedCustomField(orgId, "OAuthClient"));

	it("Should create oauth-clients", async () => {
		const { statusCode, body } = await server.post("/v1/oauth-clients").send({
			orgId,
			region: "us",
			accountId: 1,
			title: "Test client",
			status: "inactive",
			defaultOrgName: "test",
			grants: ["authorization_code", "refresh_token"],
			redirectUris: ["http://localhost:3001/api/auth/callback/oauth"],
			metadata: {
				externalRef: "OC-20",
			},
		});
		assert.equal(statusCode, 201);
		assert.equal(body.status, "inactive");
		id = body.id;
	});

	it("Should update client status", async () => {
		const { statusCode, body } = await server.put(`/v1/oauth-clients/${id}`).send({
			status: "active",
			metadata: {
				externalRef: "OC-21",
			},
		});
		assert.equal(statusCode, 200);
		assert.equal(body.id, id);
		assert.equal(body.status, "active");
		assert.equal(body.metadata.externalRef, "OC-21");
		assert.isUndefined(body.clientSecret);
	});

	it("Should return updated oauth-client", async () => {
		const { statusCode, body } = await server.get(`/v1/oauth-clients/${id}`);
		assert.equal(statusCode, 200);
		assert.equal(body.id, id);
		assert.equal(body.status, "active");
		assert.equal(body.metadata.externalRef, "OC-21");
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.put(`/v1/oauth-clients/${id}`).send({
			status: "activated",
			metadata: "bad",
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.status[0]);
		assert.isString(body.validation.body.metadata[0]);
	});

	it("Should return custom fields validation error", async () => {
		const { statusCode, body } = await server.put(`/v1/oauth-clients/${id}`).send({
			status: "active",
			metadata: {
				externalRef: "O",
			},
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.metadata.externalRef[0]);
	});
});
