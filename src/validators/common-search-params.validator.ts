import { joi } from "@structured-growth/microservice-sdk";

export const CommonSearchParamsValidator = joi.object({
	orgId: joi.number().positive().required().label("Organization ID"),
	accountId: joi.number().positive().label("Account ID"),
	id: joi.array().valid(joi.number().positive().required()).label("Entity IDs"),
	arn: joi.array().valid(joi.string().required()).label("Entity ARNs"),
	page: joi.number().positive().label("Page"),
	limit: joi.number().positive().label("Limit"),
	sort: joi.array().valid(joi.string().required()).label("Sort"),
});
