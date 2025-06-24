import { joi } from "@structured-growth/microservice-sdk";

export const OAuthClientPolicyUpdateBodyValidator = joi.object({
	oauthClientPolicyId: joi.number().positive(),
	query: joi.object(),
	body: joi.object({
		providerType: joi
			.string()
			.valid("email", "phoneNumber", "username", "google", "github", "wechat")
			.label("validator.oauthClientPolicies.providerType"),
		passwordRequired: joi.boolean().label("validator.oauthClientPolicies.passwordRequired"),
		twoFaEnabled: joi.boolean().label("validator.oauthClientPolicies.twoFaEnabled"),
		status: joi.string().valid("active", "inactive", "archived").label("validator.oauthClientPolicies.status"),
	}),
});
