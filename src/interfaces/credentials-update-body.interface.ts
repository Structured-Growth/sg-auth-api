import { CredentialsAttributes } from "../../database/models/credentials";

export interface CredentialsUpdateBodyInterface {
	password?: CredentialsAttributes["password"];
	providerType?: CredentialsAttributes["providerType"];
	status?: CredentialsAttributes["status"];
	otpId?: number;
}
