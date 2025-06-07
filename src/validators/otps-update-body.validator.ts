import { joi } from "@structured-growth/microservice-sdk";

export const OTPsUpdateBodyValidator = joi.object({
	otpId: joi.number().required(),
	query: joi.object(),
	body: joi.object({
		status: joi.string().valid("archived", "inactive").label("validator.otps.status"),
	}),
});
