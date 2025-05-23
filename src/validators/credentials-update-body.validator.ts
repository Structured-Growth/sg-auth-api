import { joi, PasswordValidator } from "@structured-growth/microservice-sdk";

export const CredentialsUpdateBodyValidator = joi.object({
	credentialsId: joi.number().required(),
	query: joi.object(),
	body: joi.object({
		password: PasswordValidator.label("validator.credentials.password"),
		providerType: joi
			.string()
			.valid("email", "phoneNumber", "username", "oauth")
			.label("validator.credentials.providerType"),
		status: joi.string().valid("verification", "active", "inactive").label("validator.credentials.status"),
	}),
});
