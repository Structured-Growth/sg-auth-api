import { joi } from "@structured-growth/microservice-sdk";

export const PermittedOrganizationDeleteParamsValidator = joi.object({
	permittedOrganizationId: joi.number().positive().required().label("Permitted Organization Id"),
});
