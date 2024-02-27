import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";
import Credentials from "../../../../database/models/credentials";

describe("DELETE /api/v1/credentials/:credentialsId", () => {
	const server = agent(webServer(routes));
	let id;

	before(async () => {
		await container.resolve<App>("App").ready;
		await Credentials.truncate({ restartIdentity: true });
	});

	it("Should create credentials", async () => {
		const { statusCode, body } = await server.post("/v1/credentials").send({
			orgId: 1,
			region: "us",
			accountId: 1,
			provider: "local",
			providerId: "example@test.com",
			password: "Fld2ZaW4sV@?6k)A",
			status: "active",
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		id = body.id;
	});

	it("Should delete credentials", async () => {
		const { statusCode, body } = await server.delete(`/v1/credentials/${id}`);
		assert.equal(statusCode, 204);
	});


	it("Should return not found error", async () => {
		const { statusCode, body } = await server.get(`/v1/credentials/${id}`);
		assert.equal(statusCode, 404);
	});

});
