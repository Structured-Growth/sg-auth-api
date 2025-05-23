import { joi, PasswordValidator } from "@structured-growth/microservice-sdk";

export const CredentialsCreateBodyValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		orgId: joi.number().positive().required().label("validator.credentials.orgId"),
		region: joi.string().valid("us").required().label("validator.credentials.region"),
		accountId: joi.number().positive().required().label("validator.credentials.accountId"),
		provider: joi.string().valid("local", "google", "github").required().label("validator.credentials.provider"),
		providerType: joi
			.string()
			.valid("email", "phoneNumber", "username", "oauth")
			.required()
			.label("validator.credentials.providerType"),
		providerId: joi.string().required().min(1).max(100).label("validator.credentials.providerId"),
		password: PasswordValidator.label("validator.credentials.password"),
		status: joi.string().valid("verification", "active", "inactive").required().label("validator.credentials.status"),
	}),
});
