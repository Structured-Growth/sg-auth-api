import { joi } from "@structured-growth/microservice-sdk";

export const OTPsCheckBodyValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		orgId: joi.number().positive().required().label("validator.otps.orgId"),
		providerId: joi.string().required().min(1).max(100).label("validator.otps.providerId"),
		providerType: joi
			.string()
			.valid("email", "phoneNumber", "username", "google", "github", "wechat")
			.required()
			.label("validator.otps.providerType"),
		code: joi.string().label("validator.otps.code"),
	}),
});
