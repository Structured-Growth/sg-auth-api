import { OTPsAttributes } from "../../database/models/otps";

export interface OTPsUpdateBodyInterface {
	status?: OTPsAttributes["status"];
}
