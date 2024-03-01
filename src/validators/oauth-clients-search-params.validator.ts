import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const OAuthClientsSearchParamsValidator = joi.object({
	query: joi
		.object({
			title: joi.array().items(joi.string().min(1).max(100).required()).label("Title"),
			status: joi
				.array()
				.items(joi.string().valid("verification", "active", "inactive", "archived").required())
				.label("Status"),
		})
		.concat(CommonSearchParamsValidator),
});
