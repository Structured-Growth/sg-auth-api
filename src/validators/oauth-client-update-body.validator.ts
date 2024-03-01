import { joi } from "@structured-growth/microservice-sdk";

export const OAuthClientUpdateBodyValidator = joi.object({
	oauthClientId: joi.number().positive(),
	query: joi.object(),
	body: joi.object({
		status: joi.string().valid("active", "inactive").label("Status"),
	}),
});
