import { CredentialsAttributes } from "../../database/models/credentials";

export interface CredentialsChangePasswordBodyInterface {
	oldPassword?: string;
	newPassword: string;
	providerType: CredentialsAttributes["providerType"];
}
