import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const OAuthClientsSearchParamsValidator = joi.object({
	query: joi.object({
		title: joi.array().items(joi.string().min(1).max(100).required()).label("validator.oauthClients.title"),
		clientId: joi.string().label("validator.oauthClients.clientId"),
		status: joi
			.array()
			.items(joi.string().valid("verification", "active", "inactive", "archived").required())
			.label("validator.oauthClients.status"),
		orgId: joi.number().positive().label("validator.oauthClients.orgId"),
		accountId: joi.number().positive().label("validator.oauthClients.accountId"),
		id: joi.array().items(joi.number().positive().required()).label("validator.common.id"),
		arn: joi.array().valid(joi.string().required()).label("validator.common.arn"),
		page: joi.number().positive().label("validator.common.page"),
		limit: joi.number().positive().label("validator.common.limit"),
		sort: joi.array().items(joi.string().required()).label("validator.common.sort"),
	}),
});
