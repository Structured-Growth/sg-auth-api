import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { CredentialsAttributes } from "../../database/models/credentials";

export interface CredentialsSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "accountId" | "orgId"> {
	orgId?: number;
	accountId?: number[];
	provider?: CredentialsAttributes["provider"];
	providerId?: CredentialsAttributes["providerId"];
	providerType?: CredentialsAttributes["providerType"];
	status?: CredentialsAttributes["status"][];
	otpId?: number;
	/**
	 * Search by custom entity fields.
	 * Example: metadata[externalRef]=AA-22
	 */
	"metadata[customFieldName]"?: string;
}
