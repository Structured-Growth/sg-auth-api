import { joi, PasswordValidator } from "@structured-growth/microservice-sdk";

export const CredentialsChangePasswordBodyValidator = joi.object({
	credentialsId: joi.number().required(),
	query: joi.object(),
	body: joi.object({
		oldPassword: PasswordValidator.label("validator.credentials.oldPassword"),
		newPassword: PasswordValidator.required().label("validator.credentials.newPassword"),
		providerType: joi
			.string()
			.valid("email", "phoneNumber", "username", "google", "github", "wechat")
			.required()
			.label("validator.credentials.providerType"),
	}),
});
