import { joi, PasswordValidator } from "@structured-growth/microservice-sdk";

export const CredentialsCreateBodyValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		orgId: joi.number().positive().required().label("Organization ID"),
		region: joi.string().valid("us").required().label("Region"),
		accountId: joi.number().positive().required().label("Account ID"),
		provider: joi.string().valid("local", "google", "github").required().label("Provider"),
		providerId: joi.string().required().min(1).max(100).label("Provider"),
		password: PasswordValidator.label("Password"),
		status: joi.string().valid("verification", "active", "inactive").required().label("Status"),
	}),
});
