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
		params.accountId && (where["accountId"] = params.accountId);
		params.provider && (where["provider"] = params.provider);
		params.providerId && (where["providerId"] = params.providerId);
		params.id && (where["id"] = { [Op.in]: params.id });
		params.status && (where["status"] = { [Op.in]: params.status });

		// todo seach by ARN with wildcards

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

	public async update(id: number, params: Partial<CredentialsUpdateAttributes>): Promise<Credentials> {
		const model = await this.read(id);
		if (!model) {
			throw new NotFoundError(`Credentials ${id} not found`);
		}
		model.setAttributes(params);

		return model.save();
	}

	public async delete(id: number): Promise<void> {
		await Credentials.destroy({ where: { id } });
	}
}
