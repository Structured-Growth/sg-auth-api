import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { OAuthClientPolicyAttributes } from "../../database/models/oauth-client-policy";

export interface OAuthClientPoliciesSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "accountId"> {
	oauthClientId?: string;
	providerType?: OAuthClientPolicyAttributes["providerType"];
	status?: OAuthClientPolicyAttributes["status"][];
}
