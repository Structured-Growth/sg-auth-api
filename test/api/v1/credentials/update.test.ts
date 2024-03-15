import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";
import Credentials from "../../../../database/models/credentials";

describe("PUT /api/v1/credentials/:credentialsId", () => {
	const server = agent(webServer(routes));
	const email = `example-${Date.now()}@test.com`;
	let id;
	let clientId;
	let clientSecret;

	before(async () => container.resolve<App>("App").ready);

	it("Should create credentials", async () => {
		const { statusCode, body } = await server.post("/v1/credentials").send({
			orgId: 1,
			region: "us",
			accountId: 1,
			provider: "local",
			providerId: email,
			password: "Fld2ZaW4sV@?6k)A",
			status: "inactive",
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.equal(body.status, "inactive");
		id = body.id;
		clientId = body.clientId;
		clientSecret = body.clientSecret;
	});

	it("Should update credentials", async () => {
		const { statusCode, body } = await server.put(`/v1/credentials/${id}`).send({
			status: "active",
		});
		assert.equal(statusCode, 200);
	});

	it("Should return updated credentials", async () => {
		const { statusCode, body } = await server.get(`/v1/credentials/${id}`);
		assert.equal(statusCode, 200);
		assert.equal(body.status, "active");
		assert.equal(body.clientId, clientId);
		assert.equal(body.clientSecret, clientSecret);
	});
});
