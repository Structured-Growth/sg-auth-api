import { joi } from "@structured-growth/microservice-sdk";

export const PermittedOrganizationCreateBodyValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		orgId: joi.number().positive().required().label("Organization ID"),
		region: joi.string().valid("us").required().label("Region"),
		accountId: joi.number().positive().required().label("Account ID"),
		status: joi.string().valid("active", "inactive").required().label("Status"),
	}),
});
