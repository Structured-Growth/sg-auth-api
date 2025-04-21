import { joi } from "@structured-growth/microservice-sdk";

export const CommonSearchParamsValidator = joi.object({
	orgId: joi.number().positive().required().label("validator.credentials.orgId"),
	accountId: joi.number().positive().label("validator.credentials.accountId"),
	id: joi.array().valid(joi.number().positive().required()).label("validator.common.id"),
	arn: joi.array().valid(joi.string().required()).label("validator.common.arn"),
	page: joi.number().positive().label("validator.common.page"),
	limit: joi.number().positive().label("validator.common.limit"),
	sort: joi.array().valid(joi.string().required()).label("validator.common.sort"),
});
