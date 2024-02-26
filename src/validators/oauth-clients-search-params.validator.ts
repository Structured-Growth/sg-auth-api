import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const OAuthClientsSearchParamsValidator = joi.object({
	query: joi
		.object({
			title: joi.string().min(1).max(100).label("Title"),
			status: joi.string().valid("verification", "active", "inactive", "archived").label("Status"),
		})
		.concat(CommonSearchParamsValidator),
});
