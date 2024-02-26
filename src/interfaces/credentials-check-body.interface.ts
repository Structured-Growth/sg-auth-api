import { CredentialsAttributes } from "../../database/models/credentials";

export interface CredentialsCheckBodyInterface {
	orgId: number;
	provider: CredentialsAttributes["provider"];
	providerId: CredentialsAttributes["providerId"];
	password?: CredentialsAttributes["password"];
}
