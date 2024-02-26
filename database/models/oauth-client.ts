import { randomBytes, createCipheriv, createDecipheriv } from "crypto";
import { BeforeCreate, BeforeUpdate, Column, DataType, Model, Table } from "sequelize-typescript";
import { Optional } from "sequelize";
import { container, RegionEnum, DefaultModelInterface } from "@structured-growth/microservice-sdk";

export interface OAuthClientAttributes extends DefaultModelInterface {
	title: string;
	clientId: string;
	clientSecretHash: string;
	clientSecretHashIv: string;
	status: "active" | "inactive" | "archived";
}

export interface OAuthClientCreationAttributes
	extends Optional<
		OAuthClientAttributes,
		"id" | "arn" | "clientId" | "clientSecretHash" | "clientSecretHashIv" | "createdAt" | "updatedAt" | "deletedAt"
	> {}

export interface OAuthClientUpdateAttributes extends Pick<OAuthClientAttributes, "title" | "status"> {}

@Table({
	tableName: "oauth_clients",
	timestamps: true,
	underscored: true,
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

	@Column(DataType.STRING)
	clientId: OAuthClientAttributes["clientId"];

	@Column(DataType.STRING)
	clientSecretHash: OAuthClientAttributes["clientSecretHash"];

	@Column(DataType.STRING)
	clientSecretHashIv: OAuthClientAttributes["clientSecretHashIv"];

	@Column(DataType.STRING)
	status: OAuthClientAttributes["status"];

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
	@BeforeUpdate
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
