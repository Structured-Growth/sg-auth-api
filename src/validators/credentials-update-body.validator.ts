import { joi, PasswordValidator } from "@structured-growth/microservice-sdk";

export const CredentialsUpdateBodyValidator = joi.object({
	credentialsId: joi.number().required(),
	query: joi.object(),
	body: joi.object({
		password: PasswordValidator.label("Password"),
		status: joi.string().valid("verification", "active", "inactive").label("Status"),
	}),
});
