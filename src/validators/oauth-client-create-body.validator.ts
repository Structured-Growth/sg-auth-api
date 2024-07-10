import { joi } from "@structured-growth/microservice-sdk";

export const OAuthClientCreateBodyValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		orgId: joi.number().positive().required().label("Organization ID"),
		region: joi.string().valid("us").required().label("Region"),
		accountId: joi.number().positive().required().label("Account ID"),
		title: joi.string().min(3).max(100).required().label("Title"),
		status: joi.string().valid("active", "inactive").label("Status"),
		defaultOrgName: joi.string().label("Default organization"),
		grants: joi
			.array()
			.items(joi.string().valid("authorization_code", "refresh_token", "client_credentials").required())
			.label("Grants")
			.required(),
		redirectUris: joi.array().items(joi.string().uri()).label("Redirect URIs").required(),
	}),
});
