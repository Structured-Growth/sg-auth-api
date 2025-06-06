import { Op } from "sequelize";
import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	NotFoundError,
	I18nType,
	inject,
} from "@structured-growth/microservice-sdk";
import Credentials, {
	CredentialsCreationAttributes,
	CredentialsUpdateAttributes,
} from "../../../database/models/credentials";
import { CredentialsSearchParamsInterface } from "../../interfaces/credentials-search-params.interface";
import { isUndefined, omitBy } from "lodash";

@autoInjectable()
export class CredentialsRepository
	implements RepositoryInterface<Credentials, CredentialsSearchParamsInterface, CredentialsCreationAttributes>
{
	private i18n: I18nType;
	constructor(@inject("i18n") private getI18n: () => I18nType) {
		this.i18n = this.getI18n();
	}
	public async search(params: CredentialsSearchParamsInterface): Promise<SearchResultInterface<Credentials>> {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const offset = (page - 1) * limit;
		const where = {};
		const order = params.sort ? (params.sort.map((item) => item.split(":")) as any) : [["createdAt", "desc"]];

		params.orgId && (where["orgId"] = params.orgId);
		params.accountId && (where["accountId"] = { [Op.in]: params.accountId });
		params.provider && (where["provider"] = params.provider);
		params.providerType && (where["providerType"] = params.providerType);
		params.providerId && (where["providerId"] = params.providerId);
		params.id && (where["id"] = { [Op.in]: params.id });
		params.otpId && (where["otpId"] = params.otpId);
		params.status && (where["status"] = { [Op.in]: params.status });

		// todo search by ARN with wildcards

		const { rows, count } = await Credentials.findAndCountAll({
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

	public async create(params: CredentialsCreationAttributes): Promise<Credentials> {
		if (params.password) {
			params.password = Credentials.hashPassword(params.password);
		}
		return Credentials.create(params);
	}

	public async read(
		id: number,
		params?: {
			attributes?: string[];
		}
	): Promise<Credentials | null> {
		return Credentials.findByPk(id, {
			attributes: params?.attributes,
			rejectOnEmpty: false,
		});
	}

	public async update(id: number, params: CredentialsUpdateAttributes): Promise<Credentials> {
		const model = await this.read(id);
		if (!model) {
			throw new NotFoundError(
				`${this.i18n.__("error.credential.name")} ${id} ${this.i18n.__("error.common.not_found")}`
			);
		}
		if (params.password) {
			params.password = Credentials.hashPassword(params.password);
		}

		model.setAttributes(omitBy(params, isUndefined));

		return model.save();
	}

	public async delete(id: number): Promise<void> {
		return Credentials.sequelize.transaction(async (transaction) => {
			const credentials = await Credentials.findByPk(id, {
				attributes: ["id", "providerId"],
				rejectOnEmpty: false,
				transaction,
			});
			credentials.providerId = credentials.providerId + `-deleted-at-${Date.now()}`;
			await credentials.save({ transaction });
			const n = await Credentials.destroy({ where: { id }, transaction });
			if (n === 0) {
				throw new NotFoundError(
					`${this.i18n.__("error.credential.name")} ${id} ${this.i18n.__("error.common.not_found")}`
				);
			}
		});
	}
}
