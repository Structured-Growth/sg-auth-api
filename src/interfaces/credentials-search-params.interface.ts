import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { CredentialsAttributes } from "../../database/models/credentials";

export interface CredentialsSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "accountId"> {
	accountId?: number;
	provider?: CredentialsAttributes["provider"];
	providerId?: CredentialsAttributes["providerId"];
	status?: CredentialsAttributes["status"][];
}
