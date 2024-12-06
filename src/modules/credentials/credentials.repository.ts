import { Op } from "sequelize";
import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	NotFoundError,
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
	public async search(params: CredentialsSearchParamsInterface): Promise<SearchResultInterface<Credentials>> {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const offset = (page - 1) * limit;
		const where = {};
		const order = params.sort ? (params.sort.map((item) => item.split(":")) as any) : [["createdAt", "desc"]];

		params.orgId && (where["orgId"] = params.orgId);
		params.accountId && (where["accountId"] = { [Op.in]: params.accountId });
		params.provider && (where["provider"] = params.provider);
		params.providerId && (where["providerId"] = params.providerId);
		params.id && (where["id"] = { [Op.in]: params.id });
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
			throw new NotFoundError(`Credentials ${id} not found`);
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
				throw new NotFoundError(`Credentials ${id} not found`);
			}
		});
	}
}
