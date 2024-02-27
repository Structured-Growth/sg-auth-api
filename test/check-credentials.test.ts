import "../src/app/providers";
import { assert } from "chai";
import { App } from "../src/app/app";
import { container, RegionEnum } from "@structured-growth/microservice-sdk";
import { CredentialsService } from "../src/modules/credentials/credentials.service";
import * as hyperid from "hyperid";

describe("Check credentials", () => {
	const app: App = container.resolve("App");
	const credentialsService: CredentialsService = container.resolve("CredentialsService");
	const password = hyperid()();

	before(async () => app.ready);

	it("Should encrypt password", async () => {
		const model = await credentialsService.create({
			orgId: 1,
			region: RegionEnum.US,
			accountId: 1,
			provider: "local",
			providerId: `${password}@example.com`,
			password: password,
			status: "active",
		});
		assert.notEqual(password, model.password);
		assert.isTrue(model.validatePassword(password));
		assert.isFalse(model.validatePassword("111111"));
	});

	it("Should return encrypted password", async () => {
		const result = await credentialsService.check({
			orgId: 1,
			provider: "local",
			providerId: `${password}@example.com`,
			password: password,
		});

		assert.equal(result.status, "active");
		assert.notEqual(result.password, password);
	});
});
