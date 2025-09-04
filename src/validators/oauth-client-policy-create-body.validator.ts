import { joi } from "@structured-growth/microservice-sdk";

export const OAuthClientPolicyCreateBodyValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		orgId: joi.number().positive().required().label("validator.oauthClientPolicies.orgId"),
		region: joi.string().min(2).required().label("validator.oauthClientPolicies.region"),
		oauthClientId: joi.number().required().label("validator.oauthClients.oauthClientId"),
		providerType: joi
			.string()
			.valid("email", "phoneNumber", "username", "google", "github", "wechat")
			.required()
			.label("validator.oauthClientPolicies.providerType"),
		passwordRequired: joi.boolean().required().label("validator.oauthClientPolicies.passwordRequired"),
		twoFaEnabled: joi.boolean().required().label("validator.oauthClientPolicies.twoFaEnabled"),
		status: joi.string().valid("active", "inactive").label("validator.oauthClientPolicies.status"),
	}),
});
