import { genSaltSync, hashSync, compareSync } from "bcrypt";
import { BeforeCreate, BeforeUpdate, Column, DataType, Model, Table } from "sequelize-typescript";
import { container, RegionEnum, DefaultModelInterface } from "@structured-growth/microservice-sdk";

export interface CredentialsAttributes extends DefaultModelInterface {
	provider: "local" | "google";
	providerId: string;
	password: string;
	status: "verification" | "active" | "inactive" | "archived";
}

export interface CredentialsCreationAttributes
	extends Omit<CredentialsAttributes, "id" | "arn" | "createdAt" | "updatedAt" | "deletedAt"> {}

export interface CredentialsUpdateAttributes extends Partial<Pick<CredentialsAttributes, "status" | "password">> {}

@Table({
	tableName: "credentials",
	timestamps: true,
	underscored: true,
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
	providerId: CredentialsAttributes["providerId"];

	@Column(DataType.STRING)
	password: CredentialsAttributes["password"];

	@Column(DataType.STRING)
	status: CredentialsAttributes["status"];

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

	@BeforeCreate
	@BeforeUpdate
	static hashPassword(model: Credentials): void {
		if (model.password) {
			const salt = genSaltSync(2);
			model.password = hashSync(model.password, salt);
		}
	}

	/**
	 * Compare password wirh encrypted
	 */
	validatePassword(password: string): boolean {
		return compareSync(password, this.password);
	}
}

export default Credentials;
