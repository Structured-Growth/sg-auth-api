import { joi } from "@structured-growth/microservice-sdk";

export const OTPsSearchParamsValidator = joi.object({
	query: joi.object({
		providerId: joi.string().label("validator.otps.providerId"),
		status: joi
			.array()
			.items(joi.string().valid("active", "inactive", "archived").required())
			.label("validator.otps.status"),
		orgId: joi.number().positive().label("validator.otps.orgId"),
		credentialId: joi.number().positive().label("validator.otps.credentialId"),
		id: joi.array().items(joi.number().positive().required()).label("validator.common.id"),
		arn: joi.array().valid(joi.string().required()).label("validator.common.arn"),
		page: joi.number().positive().label("validator.common.page"),
		limit: joi.number().positive().label("validator.common.limit"),
		sort: joi.array().valid(joi.string().required()).label("validator.common.sort"),
	}),
});
