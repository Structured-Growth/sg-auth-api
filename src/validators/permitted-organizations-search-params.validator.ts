import { joi } from "@structured-growth/microservice-sdk";

export const PermittedOrganizationsSearchParamsValidator = joi.object({
	query: joi.object({
		id: joi.array().items(joi.number().positive().required()).label("validator.common.id"),
		orgId: joi.number().positive().label("validator.permittedOrganizations.orgId"),
		accountId: joi
			.array()
			.items(joi.number().positive().required())
			.label("validator.permittedOrganizations.accountId"),
		status: joi
			.array()
			.items(joi.string().valid("active", "inactive", "archived").required())
			.label("validator.permittedOrganizations.status"),
		arn: joi.array().valid(joi.string().required()).label("validator.common.arn"),
		page: joi.number().positive().label("validator.common.page"),
		limit: joi.number().positive().label("validator.common.limit"),
		sort: joi.array().items(joi.string().required()).label("validator.common.sort"),
	}),
});
