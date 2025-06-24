import { joi } from "@structured-growth/microservice-sdk";

export const CredentialsSearchParamsValidator = joi.object({
	query: joi.object({
		provider: joi.string().valid("local", "oauth").label("validator.credentials.provider"),
		providerId: joi.string().label("validator.credentials.providerId"),
		providerType: joi
			.string()
			.valid("email", "phoneNumber", "username", "google", "github", "wechat")
			.label("validator.credentials.providerType"),
		status: joi
			.array()
			.items(joi.string().valid("verification", "active", "inactive", "archived").required())
			.label("validator.credentials.status"),
		orgId: joi.number().positive().label("validator.credentials.orgId"),
		accountId: joi.array().items(joi.number().positive().required()).label("validator.credentials.accountId"),
		otpId: joi.number().positive().label("validator.credentials.otpId"),
		id: joi.array().items(joi.number().positive().required()).label("validator.common.id"),
		arn: joi.array().valid(joi.string().required()).label("validator.common.arn"),
		page: joi.number().positive().label("validator.common.page"),
		limit: joi.number().positive().label("validator.common.limit"),
		sort: joi.array().valid(joi.string().required()).label("validator.common.sort"),
	}),
});
