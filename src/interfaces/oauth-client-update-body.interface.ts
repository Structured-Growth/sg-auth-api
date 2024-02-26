import { OAuthClientUpdateAttributes } from "../../database/models/oauth-client";

export interface OAuthClientUpdateBodyInterface {
	status: OAuthClientUpdateAttributes["status"];
}
