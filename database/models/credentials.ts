import { genSaltSync, hashSync, compareSync } from "bcrypt";
import { Column, DataType, Model, Table } from "sequelize-typescript";
import { container, RegionEnum, DefaultModelInterface } from "@structured-growth/microservice-sdk";

export interface CredentialsAttributes extends DefaultModelInterface {
	provider: "local" | "oauth";
	providerType: "email" | "phoneNumber" | "username" | "google" | "github" | "wechat";
	providerId: string;
	password: string;
	metadata: Record<string, unknown>;
	status: "verification" | "active" | "inactive" | "archived";
	otpId?: number | null;
}

export interface CredentialsCreationAttributes
	extends Omit<CredentialsAttributes, "id" | "arn" | "createdAt" | "updatedAt" | "deletedAt" | "metadata"> {
	metadata?: Record<string, unknown>;
}

export interface CredentialsUpdateAttributes
	extends Partial<Pick<CredentialsAttributes, "status" | "password" | "providerType" | "otpId" | "metadata">> {}

@Table({
	tableName: "credentials",
	timestamps: true,
	underscored: true,
	paranoid: true,
})
export class Credentials
	extends Model<CredentialsAttributes, CredentialsCreationAttributes>
	implements CredentialsAttributes
{
	@Column
	orgId: number;

	@Column
	region: RegionEnum;

	@Column
	accountId: number;

	@Column(DataType.STRING)
	provider: CredentialsAttributes["provider"];

	@Column(DataType.STRING)
	providerType: CredentialsAttributes["providerType"];

	@Column(DataType.STRING)
	providerId: CredentialsAttributes["providerId"];

	@Column(DataType.STRING)
	password: CredentialsAttributes["password"];

	@Column(DataType.JSONB)
	metadata: Record<string, unknown>;

	@Column(DataType.STRING)
	status: CredentialsAttributes["status"];

	@Column({ allowNull: true })
	otpId: number | null;

	static get arnPattern(): string {
		return [container.resolve("appPrefix"), "<region>", "<orgId>", "<accountId>", `credentials/<credentialsId>`].join(
			":"
		);
	}

	get arn(): string {
		return [container.resolve("appPrefix"), this.region, this.orgId, this.accountId, `credentials/${this.id}`].join(
			":"
		);
	}

	static hashPassword(password: string): string {
		const salt = genSaltSync(2);
		return hashSync(password, salt);
	}

	/**
	 * Compare password with encrypted
	 */
	validatePassword(password: string): boolean {
		return compareSync(password, this.password);
	}
}

export default Credentials;
