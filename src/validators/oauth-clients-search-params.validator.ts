import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const OAuthClientsSearchParamsValidator = joi.object({
	query: joi.object({
		title: joi.array().items(joi.string().min(1).max(100).required()).label("Title"),
		clientId: joi.string().label("Client ID"),
		status: joi
			.array()
			.items(joi.string().valid("verification", "active", "inactive", "archived").required())
			.label("Status"),
		orgId: joi.number().positive().label("Organization ID"),
		accountId: joi.number().positive().label("Account ID"),
		id: joi.array().items(joi.number().positive().required()).label("Entity IDs"),
		arn: joi.array().valid(joi.string().required()).label("Entity ARNs"),
		page: joi.number().positive().label("Page"),
		limit: joi.number().positive().label("Limit"),
		sort: joi.array().items(joi.string().required()).label("Sort"),
	}),
});
