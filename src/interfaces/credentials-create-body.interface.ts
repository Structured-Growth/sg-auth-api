import { BelongsToAccountInterface, BelongsToOrgInterface } from "@structured-growth/microservice-sdk";
import { CredentialsAttributes } from "../../database/models/credentials";

export interface CredentialsCreateBodyInterface extends BelongsToAccountInterface, BelongsToOrgInterface {
	provider: CredentialsAttributes["provider"];
	providerId: CredentialsAttributes["providerId"];
	password?: CredentialsAttributes["password"];
	status: CredentialsAttributes["status"];
}
