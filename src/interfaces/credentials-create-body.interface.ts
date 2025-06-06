import { BelongsToAccountInterface, BelongsToOrgInterface } from "@structured-growth/microservice-sdk";
import { CredentialsAttributes } from "../../database/models/credentials";

export interface CredentialsCreateBodyInterface extends BelongsToAccountInterface, BelongsToOrgInterface {
	/**
	 * - local: email/password or username/password authentication
	 * - google: authentication via Google
	 */
	provider: CredentialsAttributes["provider"];
	providerType: CredentialsAttributes["providerType"];
	/**
	 * In case with the local provider it may be either email or random username.
	 * In case with oauth provider here will be provider id (e.g. Google Account ID).
	 */
	providerId: CredentialsAttributes["providerId"];
	otpId?: number;
	/**
	 * Password is required if local (e.g. email/password) provider is used.
	 */
	password?: CredentialsAttributes["password"];
	status: CredentialsAttributes["status"];
}
