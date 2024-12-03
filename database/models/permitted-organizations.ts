import { Column, DataType, Model, Table } from "sequelize-typescript";
import { container, RegionEnum, DefaultModelInterface } from "@structured-growth/microservice-sdk";

export interface PermittedOrganizationsAttributes extends DefaultModelInterface {
	status: "active" | "inactive" | "archived";
}

export interface PermittedOrganizationsCreationAttributes
	extends Omit<PermittedOrganizationsAttributes, "id" | "arn" | "createdAt" | "updatedAt" | "deletedAt"> {}

export interface PermittedOrganizationsUpdateAttributes
	extends Partial<Pick<PermittedOrganizationsAttributes, "status">> {}

@Table({
	tableName: "permitted_organizations",
	timestamps: true,
	underscored: true,
	paranoid: true,
})
export class PermittedOrganizations
	extends Model<PermittedOrganizationsAttributes, PermittedOrganizationsCreationAttributes>
	implements PermittedOrganizationsAttributes
{
	@Column
	orgId: number;

	@Column
	region: RegionEnum;

	@Column
	accountId: number;

	@Column(DataType.STRING)
	status: PermittedOrganizationsAttributes["status"];

	static get arnPattern(): string {
		return [
			container.resolve("appPrefix"),
			"<region>",
			"<orgId>",
			"<accountId>",
			`permitted-organizations/<permittedOrganizationId>`,
		].join(":");
	}

	get arn(): string {
		return [
			container.resolve("appPrefix"),
			this.region,
			this.orgId,
			this.accountId,
			`permitted-organizations/${this.id}`,
		].join(":");
	}
}

export default PermittedOrganizations;
