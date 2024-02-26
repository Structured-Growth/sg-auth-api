import "../src/app/providers";
import { App } from "../src/app/app";
import { container, RegionEnum } from "@structured-growth/microservice-sdk";
import OAuthClient from "../database/models/oauth-client";
import { assert } from "chai";

describe("Client secret encryption", () => {
	const app: App = container.resolve("App");
	let id;
	let secret;

	before(async () => app.ready);

	it("Should create a client with random clientId and encrypted clientSecret", async () => {
		const model = await OAuthClient.create({
			orgId: 1,
			region: RegionEnum.US,
			accountId: 1,
			title: "Test client",
			status: "active",
		});
		assert.notEqual(model.clientSecretString, model.clientSecretHash);
		id = model.id;
		secret = model.clientSecretString;
	});

	it("Should decrypt clientSecret", async () => {
		const model = await OAuthClient.findByPk(id);
		assert.equal(model.clientSecretString, secret);
	});
});
