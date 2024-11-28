import { joi } from "@structured-growth/microservice-sdk";

export const PermittedOrganizationReadParamsValidator = joi.object({
	permittedOrganizationId: joi.number().positive().required().label("Permitted Organization Id"),
});
