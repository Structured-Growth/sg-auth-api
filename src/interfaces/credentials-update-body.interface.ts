import { CredentialsAttributes } from "../../database/models/credentials";

export interface CredentialsUpdateBodyInterface {
	password?: CredentialsAttributes["password"];
	status?: CredentialsAttributes["status"];
}
