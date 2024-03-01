import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const CredentialsSearchParamsValidator = joi.object({
	query: joi
		.object({
			provider: joi.string().valid("local", "google").label("Provider"),
			providerId: joi.string().label("Provider"),
			status: joi
				.array()
				.items(joi.string().valid("verification", "active", "inactive", "archived").required())
				.label("Status"),
		})
		.concat(CommonSearchParamsValidator),
});
