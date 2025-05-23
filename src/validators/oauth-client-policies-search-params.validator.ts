import { joi } from "@structured-growth/microservice-sdk";

export const OAuthClientPoliciesSearchParamsValidator = joi.object({
	query: joi.object({
		orgId: joi.number().positive().label("validator.oauthClientPolicies.orgId"),
		oauthClientId: joi.number().positive().label("validator.oauthClientPolicies.oauthClientId"),
		providerType: joi
			.string()
			.valid("email", "phoneNumber", "username", "oauth")
			.label("validator.oauthClients.providerType"),
		status: joi
			.array()
			.items(joi.string().valid("active", "inactive", "archived").required())
			.label("validator.oauthClients.status"),
		id: joi.array().items(joi.number().positive().required()).label("validator.common.id"),
		arn: joi.array().valid(joi.string().required()).label("validator.common.arn"),
		page: joi.number().positive().label("validator.common.page"),
		limit: joi.number().positive().label("validator.common.limit"),
		sort: joi.array().items(joi.string().required()).label("validator.common.sort"),
	}),
});
