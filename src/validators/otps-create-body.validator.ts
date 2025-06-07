import { joi } from "@structured-growth/microservice-sdk";

export const OTPsCreateBodyValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		orgId: joi.number().positive().required().label("validator.otps.orgId"),
		region: joi.string().valid("us").required().label("validator.otps.region"),
		credentialId: joi.number().positive().label("validator.otps.credentialId"),
		providerId: joi.string().required().label("validator.otps.providerId"),
		code: joi.string().required().label("validator.otps.code"),
		lifeTime: joi.number().positive().required().label("validator.otps.lifeTime"),
		status: joi.string().valid("active", "inactive").required().label("validator.otps.status"),
	}),
});
