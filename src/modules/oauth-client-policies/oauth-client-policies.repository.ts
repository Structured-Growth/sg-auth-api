import { Op } from "sequelize";
import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	NotFoundError,
	I18nType,
	inject,
} from "@structured-growth/microservice-sdk";
import OauthClientPolicy, {
	OAuthClientPolicyCreationAttributes,
	OAuthClientPolicyUpdateAttributes,
} from "../../../database/models/oauth-client-policy";
import { OAuthClientPoliciesSearchParamsInterface } from "../../interfaces/oauth-client-policies-search-params.interface";
import { isUndefined, omitBy } from "lodash";

@autoInjectable()
export class OauthClientPoliciesRepository
	implements
		RepositoryInterface<
			OauthClientPolicy,
			OAuthClientPoliciesSearchParamsInterface,
			OAuthClientPolicyCreationAttributes
		>
{
	private i18n: I18nType;
	constructor(@inject("i18n") private getI18n: () => I18nType) {
		this.i18n = this.getI18n();
	}
	public async search(
		params: OAuthClientPoliciesSearchParamsInterface
	): Promise<SearchResultInterface<OauthClientPolicy>> {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const offset = (page - 1) * limit;
		const where = {};
		const order = params.sort ? (params.sort.map((item) => item.split(":")) as any) : [["createdAt", "desc"]];

		params.id && (where["id"] = { [Op.in]: params.id });
		params.orgId && (where["orgId"] = params.orgId);
		params.oauthClientId && (where["oauthClientId"] = params.oauthClientId);
		params.providerType && (where["providerType"] = params.providerType);
		params.status && (where["status"] = { [Op.in]: params.status });

		// todo search by ARN with wildcards

		const { rows, count } = await OauthClientPolicy.findAndCountAll({
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

	public async create(params: OAuthClientPolicyCreationAttributes): Promise<OauthClientPolicy> {
		return OauthClientPolicy.create(params);
	}

	public async read(
		id: number,
		params?: {
			attributes?: string[];
		}
	): Promise<OauthClientPolicy | null> {
		return OauthClientPolicy.findByPk(id, {
			attributes: params?.attributes,
			rejectOnEmpty: false,
		});
	}

	public async update(id: number, params: OAuthClientPolicyUpdateAttributes): Promise<OauthClientPolicy> {
		const model = await this.read(id);
		if (!model) {
			throw new NotFoundError(
				`${this.i18n.__("error.oauth_client_policy.name")} ${id} ${this.i18n.__("error.common.not_found")}`
			);
		}
		model.setAttributes(omitBy(params, isUndefined));

		return model.save();
	}

	public async delete(id: number): Promise<void> {
		const n = await OauthClientPolicy.destroy({ where: { id } });

		if (n === 0) {
			throw new NotFoundError(
				`${this.i18n.__("error.oauth_client_policy.name")} ${id} ${this.i18n.__("error.common.not_found")}`
			);
		}
	}
}
