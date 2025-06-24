import { OTPsAttributes } from "../../database/models/otps";

export interface OTPsCheckBodyInterface {
	orgId: number;
	providerId: string;
	providerType: OTPsAttributes["providerType"];
	code: string;
}
