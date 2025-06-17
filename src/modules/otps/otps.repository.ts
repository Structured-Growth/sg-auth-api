import { Op } from "sequelize";
import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	NotFoundError,
	I18nType,
	inject,
} from "@structured-growth/microservice-sdk";
import OTPs, { OTPsCreationAttributes, OTPsUpdateAttributes } from "../../../database/models/otps";
import { OTPsSearchParamsInterface } from "../../interfaces/otps-search-params.interface";
import { isUndefined, omitBy } from "lodash";

@autoInjectable()
export class OTPsRepository implements RepositoryInterface<OTPs, OTPsSearchParamsInterface, OTPsCreationAttributes> {
	private i18n: I18nType;
	constructor(@inject("i18n") private getI18n: () => I18nType) {
		this.i18n = this.getI18n();
	}
	public async search(params: OTPsSearchParamsInterface): Promise<SearchResultInterface<OTPs>> {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const offset = (page - 1) * limit;
		const where = {};
		const order = params.sort ? (params.sort.map((item) => item.split(":")) as any) : [["createdAt", "desc"]];

		params.orgId && (where["orgId"] = params.orgId);
		params.providerId && (where["providerId"] = params.providerId);
		params.providerType && (where["providerType"] = params.providerType);
		params.credentialId && (where["credentialId"] = params.credentialId);
		params.id && (where["id"] = { [Op.in]: params.id });
		params.status && (where["status"] = { [Op.in]: params.status });

		// todo search by ARN with wildcards

		const { rows, count } = await OTPs.findAndCountAll({
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

	public async create(params: OTPsCreationAttributes): Promise<OTPs> {
		if (params.code) {
			params.code = OTPs.hashCode(params.code);
		}
		return OTPs.create(params);
	}

	public async read(
		id: number,
		params?: {
			attributes?: string[];
		}
	): Promise<OTPs | null> {
		return OTPs.findByPk(id, {
			attributes: params?.attributes,
			rejectOnEmpty: false,
		});
	}

	public async update(id: number, params: OTPsUpdateAttributes): Promise<OTPs> {
		const model = await this.read(id);
		if (!model) {
			throw new NotFoundError(`${this.i18n.__("error.otp.name")} ${id} ${this.i18n.__("error.common.not_found")}`);
		}

		model.setAttributes(omitBy(params, isUndefined));

		return model.save();
	}

	public async delete(id: number): Promise<void> {
		return OTPs.sequelize.transaction(async (transaction) => {
			const credentials = await OTPs.findByPk(id, {
				attributes: ["id", "providerId"],
				rejectOnEmpty: false,
				transaction,
			});
			credentials.providerId = credentials.providerId + `-deleted-at-${Date.now()}`;
			await credentials.save({ transaction });
			const n = await OTPs.destroy({ where: { id }, transaction });
			if (n === 0) {
				throw new NotFoundError(`${this.i18n.__("error.otp.name")} ${id} ${this.i18n.__("error.common.not_found")}`);
			}
		});
	}
}
