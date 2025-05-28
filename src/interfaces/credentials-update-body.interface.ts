import { CredentialsAttributes } from "../../database/models/credentials";

export interface CredentialsUpdateBodyInterface {
	password?: CredentialsAttributes["password"];
	providerType?: CredentialsAttributes["providerType"];
	status?: CredentialsAttributes["status"];
	verificationCodeHash?: CredentialsAttributes["verificationCodeHash"];
	verificationCodeSalt?: CredentialsAttributes["verificationCodeSalt"];
	verificationCodeExpires?: CredentialsAttributes["verificationCodeExpires"];
}
