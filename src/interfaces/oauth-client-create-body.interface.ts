import { BelongsToAccountInterface, BelongsToOrgInterface } from "@structured-growth/microservice-sdk";
import { OAuthClientCreationAttributes } from "../../database/models/oauth-client";

export interface OAuthClientCreateBodyInterface extends BelongsToAccountInterface, BelongsToOrgInterface {
	title: OAuthClientCreationAttributes["title"];
	status?: "active" | "inactive";
}
