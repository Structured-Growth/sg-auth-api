import "../../../../src/app/providers";
import { assert } from "chai";
import { App } from "../../../../src/app/app";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { agent } from "supertest";
import { routes } from "../../../../src/routes";

describe("PUT /api/v1/credentials/:credentialsId/password", () => {
	const server = agent(webServer(routes));
	const email = `example-${Date.now()}@test.com`;
	const initialPassword = "Fld2ZaW4sV@?6k)A";
	const newPassword = "N3wPa$$w0rd#2025";
	let credentialsId: number;

	before(async () => container.resolve<App>("App").ready);

	it("Should create credentials with password", async () => {
		const { statusCode, body } = await server.post("/v1/credentials").send({
			orgId: 1,
			region: "us",
			accountId: 1,
			provider: "local",
			providerType: "email",
			providerId: email,
			status: "active",
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		credentialsId = body.id;
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.post("/v1/credentials/change-password/${credentialsId}").send({
			oldPassword: -1,
			newPassword: "usa",
			providerType: -1,
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.oldPassword[0]);
		assert.isString(body.validation.body.newPassword[0]);
		assert.isString(body.validation.body.providerType[0]);
	});

	it("Should successfully change the password without old password", async () => {
		const { statusCode, body } = await server.post(`/v1/credentials/change-password/${credentialsId}`).send({
			newPassword: initialPassword,
			providerType: "email",
		});
		assert.equal(statusCode, 201);
		assert.equal(body.id, credentialsId);
		assert.equal(body.providerId, email);
	});

	it("Should successfully change the password", async () => {
		const { statusCode, body } = await server.post(`/v1/credentials/change-password/${credentialsId}`).send({
			oldPassword: initialPassword,
			newPassword,
			providerType: "email",
		});
		assert.equal(statusCode, 201);
		assert.equal(body.id, credentialsId);
		assert.equal(body.providerId, email);
	});

	it("Should return error if old password is invalid", async () => {
		const { statusCode, body } = await server.post(`/v1/credentials/change-password/${credentialsId}`).send({
			oldPassword: newPassword + "fdf56",
			newPassword: newPassword,
			providerType: "email",
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.include(body.message, "Old password are invalid");
	});

	it("Should return error if old password is missing", async () => {
		const { statusCode, body } = await server.post(`/v1/credentials/change-password/${credentialsId}`).send({
			newPassword: initialPassword,
			providerType: "email",
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.include(body.message, "Credentials are invalid");
	});

	it("Should return error if credential not found", async () => {
		const { statusCode, body } = await server.post(`/v1/credentials/change-password/999999`).send({
			oldPassword: initialPassword,
			newPassword: newPassword,
			providerType: "email",
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.include(body.message, "Credentials are invalid");
	});
});
