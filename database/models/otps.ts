import { Column, DataType, Model, Table } from "sequelize-typescript";
import {
	container,
	RegionEnum,
	DefaultModelInterface,
	BelongsToAccountInterface,
} from "@structured-growth/microservice-sdk";
import { compareSync, genSaltSync, hashSync } from "bcrypt";

export interface OTPsAttributes extends Omit<DefaultModelInterface, keyof BelongsToAccountInterface> {
	credentialId?: number;
	providerId: string;
	providerType: "email" | "phoneNumber" | "username" | "google" | "github" | "wechat";
	code: string;
	lifeTime: number;
	status: "active" | "inactive" | "archived";
}

export interface OTPsCreationAttributes
	extends Omit<OTPsAttributes, "id" | "arn" | "createdAt" | "updatedAt" | "deletedAt"> {}

export interface OTPsUpdateAttributes extends Partial<Pick<OTPsAttributes, "status">> {}

@Table({
	tableName: "otps",
	timestamps: true,
	underscored: true,
	paranoid: true,
})
export class OTPs extends Model<OTPsAttributes, OTPsCreationAttributes> implements OTPsAttributes {
	@Column
	orgId: number;

	@Column
	region: RegionEnum;

	@Column
	credentialId?: number;

	@Column(DataType.STRING)
	providerId: string;

	@Column(DataType.STRING)
	providerType: OTPsAttributes["providerType"];

	@Column(DataType.STRING)
	code: string;

	@Column
	lifeTime: number;

	@Column(DataType.STRING)
	status: OTPsAttributes["status"];

	static get arnPattern(): string {
		return [container.resolve("appPrefix"), "<region>", "<orgId>", "<accountId>", `otps/<otpId>`].join(":");
	}

	get arn(): string {
		return [container.resolve("appPrefix"), this.region, this.orgId, "-", `otps/${this.id}`].join(":");
	}

	static hashCode(code: string): string {
		const salt = genSaltSync(2);
		return hashSync(code, salt);
	}

	/**
	 * Compare code with encrypted
	 */
	validateCode(code: string): boolean {
		return compareSync(code, this.code);
	}
}

export default OTPs;
