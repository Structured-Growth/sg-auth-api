import { joi } from "@structured-growth/microservice-sdk";

export const PermittedOrganizationCreateBodyValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		orgId: joi.number().positive().required().label("validator.permittedOrganizations.orgId"),
		region: joi.string().valid("us").required().label("validator.permittedOrganizations.region"),
		accountId: joi.number().positive().required().label("validator.permittedOrganizations.accountId"),
		status: joi.string().valid("active", "inactive").required().label("validator.permittedOrganizations.status"),
	}),
});
