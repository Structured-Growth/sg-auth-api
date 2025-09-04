import { joi } from "@structured-growth/microservice-sdk";

export const OAuthClientCreateBodyValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		orgId: joi.number().positive().required().label("validator.oauthClients.orgId"),
		region: joi.string().min(2).required().label("validator.oauthClients.region"),
		accountId: joi.number().positive().required().label("validator.oauthClients.accountId"),
		title: joi.string().min(3).max(100).required().label("validator.oauthClients.title"),
		status: joi.string().valid("active", "inactive").label("validator.oauthClients.status"),
		defaultOrgName: joi.string().label("validator.oauthClients.defaultOrgName"),
		grants: joi
			.array()
			.items(joi.string().valid("authorization_code", "refresh_token", "client_credentials", "password").required())
			.label("validator.oauthClients.grants")
			.required(),
		redirectUris: joi.array().items(joi.string().uri()).label("validator.oauthClients.redirectUris").required(),
	}),
});
