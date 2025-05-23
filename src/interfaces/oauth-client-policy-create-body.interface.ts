import { BelongsToOrgInterface } from "@structured-growth/microservice-sdk";
import { OAuthClientPolicyAttributes } from "../../database/models/oauth-client-policy";

export interface OAuthClientPolicyCreateBodyInterface extends BelongsToOrgInterface {
	oauthClientId: number;
	providerType: OAuthClientPolicyAttributes["providerType"];
	passwordRequired: boolean;
	twoFaEnabled: boolean;
	status: "active" | "inactive";
}
