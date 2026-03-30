import { OAuthClientPolicyAttributes } from "../../database/models/oauth-client-policy";

export interface OAuthClientPolicyUpdateBodyInterface {
	providerType: OAuthClientPolicyAttributes["providerType"];
	passwordRequired: boolean;
	twoFaEnabled: boolean;
	metadata?: Record<string, unknown> | null;
	status: "active" | "inactive" | "archived";
}
