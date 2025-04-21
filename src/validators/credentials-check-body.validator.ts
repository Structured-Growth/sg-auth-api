import { joi } from "@structured-growth/microservice-sdk";

export const CredentialsCheckBodyValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		orgId: joi.number().positive().required().label("validator.credentials.orgId"),
		provider: joi.string().valid("local", "google", "github").required().label("validator.credentials.provider"),
		providerId: joi.string().required().min(1).max(100).label("validator.credentials.providerId"),
		password: joi.string().label("validator.credentials.password"),
	}),
});
