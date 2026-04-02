import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { OAuthClientPolicyAttributes } from "../../database/models/oauth-client-policy";

export interface OAuthClientPoliciesSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "accountId"> {
	orgId: number;
	oauthClientId?: number;
	providerType?: OAuthClientPolicyAttributes["providerType"];
	status?: OAuthClientPolicyAttributes["status"][];
	/**
	 * Search by custom entity fields.
	 * Example: metadata[externalRef]=PL-21
	 */
	"metadata[customFieldName]"?: string;
}
