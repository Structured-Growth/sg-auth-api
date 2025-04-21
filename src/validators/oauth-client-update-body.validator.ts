import { joi } from "@structured-growth/microservice-sdk";

export const OAuthClientUpdateBodyValidator = joi.object({
	oauthClientId: joi.number().positive(),
	query: joi.object(),
	body: joi.object({
		status: joi.string().valid("active", "inactive").label("validator.oauthClients.status"),
		defaultOrgName: joi.string().label("validator.oauthClients.defaultOrgName"),
		grants: joi
			.array()
			.items(joi.string().valid("authorization_code", "refresh_token", "client_credentials", "password").required())
			.label("validator.oauthClients.grants"),
		redirectUris: joi.array().items(joi.string().uri().required()).label("validator.oauthClients.redirectUris"),
	}),
});
