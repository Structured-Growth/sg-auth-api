import { joi } from "@structured-growth/microservice-sdk";

export const CredentialsCheckBodyValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		orgId: joi.number().positive().required().label("Organization ID"),
		provider: joi.string().valid("local", "google", "github").required().label("Provider"),
		providerId: joi.string().required().min(1).max(100).label("Provider"),
		password: joi.string().label("Password"),
	}),
});
