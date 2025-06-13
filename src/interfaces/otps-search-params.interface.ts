import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { OTPsAttributes } from "../../database/models/otps";

export interface OTPsSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "accountId" | "orgId"> {
	orgId?: number;
	providerId?: string;
	providerType?: OTPsAttributes["providerType"];
	credentialId?: number;
	status?: OTPsAttributes["status"][];
}
