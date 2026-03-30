import { joi } from "@structured-growth/microservice-sdk";

export const PermittedOrganizationUpdateBodyValidator = joi.object({
	permittedOrganizationId: joi.number().positive(),
	query: joi.object(),
	body: joi.object({
		status: joi.string().valid("active", "inactive").label("validator.permittedOrganizations.status"),
		metadata: joi.object().allow(null).label("validator.permittedOrganizations.metadata"),
	}),
});
