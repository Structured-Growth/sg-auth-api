import { randomBytes, createCipheriv, createDecipheriv } from "crypto";
import { BeforeCreate, BeforeUpdate, Column, DataType, Model, Table } from "sequelize-typescript";
import { container, RegionEnum, DefaultModelInterface } from "@structured-growth/microservice-sdk";

export interface OAuthClientAttributes extends DefaultModelInterface {
	title: string;
	defaultOrgName: string;
	clientId: string;
	clientSecretHash: string;
	clientSecretHashIv: string;
	grants: string[];
	redirectUris: string[];
	status: "active" | "inactive" | "archived";
}

export interface OAuthClientCreationAttributes
	extends Omit<
		OAuthClientAttributes,
		"id" | "arn" | "clientId" | "clientSecretHash" | "clientSecretHashIv" | "createdAt" | "updatedAt" | "deletedAt"
	> {}

export interface OAuthClientUpdateAttributes
	extends Partial<Pick<OAuthClientAttributes, "title" | "status" | "defaultOrgName" | "grants" | "redirectUris">> {}

@Table({
	tableName: "oauth_clients",
	timestamps: true,
	underscored: true,
	paranoid: true,
})
export class OAuthClient
	extends Model<OAuthClientAttributes, OAuthClientCreationAttributes>
	implements OAuthClientAttributes
{
	@Column
	orgId: number;

	@Column
	region: RegionEnum;

	@Column
	accountId: number;

	@Column
	title: string;

	@Column
	defaultOrgName: string;

	@Column(DataType.STRING)
	clientId: OAuthClientAttributes["clientId"];

	@Column(DataType.STRING)
	clientSecretHash: OAuthClientAttributes["clientSecretHash"];

	@Column(DataType.STRING)
	clientSecretHashIv: OAuthClientAttributes["clientSecretHashIv"];

	@Column(DataType.STRING)
	status: OAuthClientAttributes["status"];

	@Column(DataType.JSON)
	grants: string[];

	@Column(DataType.JSON)
	redirectUris: string[];

	static get arnPattern(): string {
		return [container.resolve("appPrefix"), "<region>", "<orgId>", "<accountId>", `oauth-client/<credentialsId>`].join(
			":"
		);
	}

	get arn(): string {
		return [container.resolve("appPrefix"), this.region, this.orgId, this.accountId, `oauth-client/${this.id}`].join(
			":"
		);
	}

	@BeforeCreate
	static generateAndEncryptSecrets(model: OAuthClient): void {
		model.clientId = Buffer.from(randomBytes(16)).toString("hex");
		const clientSecretHashIv = randomBytes(16);
		const clientSecret = randomBytes(32).toString("hex");
		const encryptionKey: string = container.resolve("encryptionKey");
		const cipher = createCipheriv("aes-256-cbc", encryptionKey, clientSecretHashIv);
		let encryptedSecretKey = cipher.update(clientSecret, "utf-8", "hex");
		encryptedSecretKey += cipher.final("hex");
		model.clientSecretHash = Buffer.from(encryptedSecretKey).toString("base64");
		model.clientSecretHashIv = clientSecretHashIv.toString("base64");
	}

	get clientSecretString(): string {
		const buff = Buffer.from(this.clientSecretHash, "base64");
		const encryptionKey: string = container.resolve("encryptionKey");
		const clientSecretHashIv = Buffer.from(this.clientSecretHashIv, "base64");
		const decipher = createDecipheriv("aes-256-cbc", encryptionKey, clientSecretHashIv);
		let decrypted = decipher.update(buff.toString("utf8"), "hex", "utf-8");
		decrypted += decipher.final("utf-8");

		return decrypted;
	}
}

export default OAuthClient;
