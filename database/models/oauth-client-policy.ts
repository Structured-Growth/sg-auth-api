import { Column, DataType, Model, Table } from "sequelize-typescript";
import { container, RegionEnum, DefaultModelInterface } from "@structured-growth/microservice-sdk";

export interface OAuthClientPolicyAttributes extends Omit<DefaultModelInterface, "accountId"> {
	oauthClientId: number;
	providerType: "email" | "phoneNumber" | "username" | "oauth";
	passwordRequired: boolean;
	twoFaEnabled: boolean;
	status: "active" | "inactive" | "archived";
}

export interface OAuthClientPolicyCreationAttributes
	extends Omit<OAuthClientPolicyAttributes, "id" | "arn" | "createdAt" | "updatedAt" | "deletedAt"> {}

export interface OAuthClientPolicyUpdateAttributes
	extends Partial<Pick<OAuthClientPolicyAttributes, "providerType" | "passwordRequired" | "twoFaEnabled" | "status">> {}

@Table({
	tableName: "oauth_client_policies",
	timestamps: true,
	underscored: true,
	paranoid: true,
})
export class OauthClientPolicy
	extends Model<OAuthClientPolicyAttributes, OAuthClientPolicyCreationAttributes>
	implements OAuthClientPolicyAttributes
{
	@Column
	orgId: number;

	@Column
	region: RegionEnum;

	@Column
	oauthClientId: number;

	@Column(DataType.STRING)
	providerType: OAuthClientPolicyAttributes["providerType"];

	@Column
	passwordRequired: boolean;

	@Column
	twoFaEnabled: boolean;

	@Column(DataType.STRING)
	status: OAuthClientPolicyAttributes["status"];

	static get arnPattern(): string {
		return [
			container.resolve("appPrefix"),
			"<region>",
			"<orgId>",
			"<oauthClientId>",
			`oauth-client-policy/<oauthClientPolicy>`,
		].join(":");
	}

	get arn(): string {
		return [
			container.resolve("appPrefix"),
			this.region,
			this.orgId,
			this.oauthClientId,
			`oauth-client-policy/${this.id}`,
		].join(":");
	}
}

export default OauthClientPolicy;
