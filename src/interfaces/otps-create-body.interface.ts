import { BelongsToOrgInterface } from "@structured-growth/microservice-sdk";
import { OTPsAttributes } from "../../database/models/otps";

export interface OTPsCreateBodyInterface extends BelongsToOrgInterface {
	credentialId?: number;
	providerId: string;
	providerType: OTPsAttributes["providerType"];
	code: string;
	lifeTime: number;
	status: OTPsAttributes["status"];
}
