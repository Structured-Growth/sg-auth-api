import { joi } from "@structured-growth/microservice-sdk";

export const PermittedOrganizationsSearchParamsValidator = joi.object({
	query: joi.object({
		id: joi.array().items(joi.number().positive().required()).label("Entity IDs"),
		orgId: joi.number().positive().label("Organization ID"),
		accountId: joi.array().items(joi.number().positive().required()).label("Entity Account IDs"),
		status: joi.array().items(joi.string().valid("active", "inactive", "archived").required()).label("Status"),
		arn: joi.array().valid(joi.string().required()).label("Entity ARNs"),
		page: joi.number().positive().label("Page"),
		limit: joi.number().positive().label("Limit"),
		sort: joi.array().items(joi.string().required()).label("Sort"),
	}),
});
