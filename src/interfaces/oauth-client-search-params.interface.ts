import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { OAuthClientAttributes } from "../../database/models/oauth-client";

export interface OAuthClientSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "accountId"> {
	accountId?: number;
	clientId?: string;
	title?: OAuthClientAttributes["title"][];
	status?: OAuthClientAttributes["status"][];
}
