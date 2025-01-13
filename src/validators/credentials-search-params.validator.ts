import { joi } from "@structured-growth/microservice-sdk";

export const CredentialsSearchParamsValidator = joi.object({
	query: joi.object({
		provider: joi.string().valid("local", "google").label("Provider"),
		providerId: joi.string().label("Provider"),
		status: joi
			.array()
			.items(joi.string().valid("verification", "active", "inactive", "archived").required())
			.label("Status"),
		orgId: joi.number().positive().label("Organization ID"),
		accountId: joi.array().items(joi.number().positive().required()).label("Entity Account IDs"),
		id: joi.array().items(joi.number().positive().required()).label("Entity IDs"),
		arn: joi.array().valid(joi.string().required()).label("Entity ARNs"),
		page: joi.number().positive().label("Page"),
		limit: joi.number().positive().label("Limit"),
		sort: joi.array().valid(joi.string().required()).label("Sort"),
	}),
});
