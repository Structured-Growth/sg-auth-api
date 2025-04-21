import { Op } from "sequelize";
import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	NotFoundError,
	I18nType,
	inject,
} from "@structured-growth/microservice-sdk";
import OAuthClient, {
	OAuthClientCreationAttributes,
	OAuthClientUpdateAttributes,
} from "../../../database/models/oauth-client";
import { OAuthClientSearchParamsInterface } from "../../interfaces/oauth-client-search-params.interface";
import { isUndefined, omitBy } from "lodash";

@autoInjectable()
export class OauthClientsRepository
	implements RepositoryInterface<OAuthClient, OAuthClientSearchParamsInterface, OAuthClientCreationAttributes>
{
	private i18n: I18nType;
	constructor(@inject("i18n") private getI18n: () => I18nType) {
		this.i18n = this.getI18n();
	}
	public async search(params: OAuthClientSearchParamsInterface): Promise<SearchResultInterface<OAuthClient>> {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const offset = (page - 1) * limit;
		const where = {};
		const order = params.sort ? (params.sort.map((item) => item.split(":")) as any) : [["createdAt", "desc"]];

		params.id && (where["id"] = { [Op.in]: params.id });
		params.orgId && (where["orgId"] = params.orgId);
		params.accountId && (where["accountId"] = params.accountId);
		params.clientId && (where["clientId"] = params.clientId);
		params.status && (where["status"] = { [Op.in]: params.status });

		if (params.title?.length > 0) {
			where["title"] = {
				[Op.or]: params.title.map((str) => ({ [Op.iLike]: str.replace(/\*/g, "%") })),
			};
		}

		// todo search by ARN with wildcards

		const { rows, count } = await OAuthClient.findAndCountAll({
			where,
			offset,
			limit,
			order,
		});

		return {
			data: rows,
			total: count,
			limit,
			page,
		};
	}

	public async create(params: OAuthClientCreationAttributes): Promise<OAuthClient> {
		return OAuthClient.create(params);
	}

	public async read(
		id: number,
		params?: {
			attributes?: string[];
		}
	): Promise<OAuthClient | null> {
		return OAuthClient.findByPk(id, {
			attributes: params?.attributes,
			rejectOnEmpty: false,
		});
	}

	public async update(id: number, params: OAuthClientUpdateAttributes): Promise<OAuthClient> {
		const model = await this.read(id);
		if (!model) {
			throw new NotFoundError(
				`${this.i18n.__("error.oauth_client.name")} ${id} ${this.i18n.__("error.common.not_found")}`
			);
		}
		model.setAttributes(omitBy(params, isUndefined));

		return model.save();
	}

	public async delete(id: number): Promise<void> {
		return OAuthClient.sequelize.transaction(async (transaction) => {
			const client = await OAuthClient.findByPk(id, {
				attributes: ["id", "clientId"],
				rejectOnEmpty: false,
				transaction,
			});
			client.clientId = client.clientId + `-deleted-at-${Date.now()}`;
			await client.save({ transaction });
			const n = await OAuthClient.destroy({ where: { id }, transaction });
			if (n === 0) {
				throw new NotFoundError(
					`${this.i18n.__("error.oauth_client.name")} ${id} ${this.i18n.__("error.common.not_found")}`
				);
			}
		});
	}
}
