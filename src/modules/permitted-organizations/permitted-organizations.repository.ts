import { Op, Sequelize } from "sequelize";
import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	NotFoundError,
	I18nType,
	inject,
} from "@structured-growth/microservice-sdk";
import PermittedOrganizations, {
	PermittedOrganizationsCreationAttributes,
	PermittedOrganizationsUpdateAttributes,
} from "../../../database/models/permitted-organizations";
import { PermittedOrganizationsSearchParamsInterface } from "../../interfaces/permitted-organizations-search-params.interface";
import { isUndefined, omitBy } from "lodash";

@autoInjectable()
export class PermittedOrganizationsRepository
	implements
		RepositoryInterface<
			PermittedOrganizations,
			PermittedOrganizationsSearchParamsInterface,
			PermittedOrganizationsCreationAttributes
		>
{
	private i18n: I18nType;
	constructor(@inject("i18n") private getI18n: () => I18nType) {
		this.i18n = this.getI18n();
	}
	public async search(
		params: PermittedOrganizationsSearchParamsInterface & { metadata?: Record<string, unknown> }
	): Promise<SearchResultInterface<PermittedOrganizations>> {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const offset = (page - 1) * limit;
		const where = {};
		const order = params.sort ? (params.sort.map((item) => item.split(":")) as any) : [["createdAt", "desc"]];

		params.id && (where["id"] = { [Op.in]: params.id });
		params.orgId && (where["orgId"] = params.orgId);
		params.accountId && (where["accountId"] = { [Op.in]: params.accountId });
		params.status && (where["status"] = { [Op.in]: params.status });

		if (params.metadata && typeof params.metadata === "object") {
			where[Op.and] = where[Op.and] ?? [];

			for (const [keyRaw, valRaw] of Object.entries(params.metadata)) {
				if (valRaw === null || valRaw === undefined) continue;

				const key = String(keyRaw).replace(/[^a-zA-Z0-9_-]/g, "");
				if (!key) continue;

				const value = String(valRaw).trim();
				if (!value) continue;

				const left = Sequelize.literal(`("metadata"->>'${key}')`);

				if (value.includes("*")) {
					where[Op.and].push(Sequelize.where(left, { [Op.iLike]: value.replace(/\*/g, "%") }));
				} else {
					where[Op.and].push(Sequelize.where(left, { [Op.eq]: value }));
				}
			}
		}

		const { rows, count } = await PermittedOrganizations.findAndCountAll({
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

	public async create(params: PermittedOrganizationsCreationAttributes): Promise<PermittedOrganizations> {
		return PermittedOrganizations.create(params);
	}

	public async read(
		id: number,
		params?: {
			attributes?: string[];
		}
	): Promise<PermittedOrganizations | null> {
		return PermittedOrganizations.findByPk(id, {
			attributes: params?.attributes,
			rejectOnEmpty: false,
		});
	}

	public async update(id: number, params: PermittedOrganizationsUpdateAttributes): Promise<PermittedOrganizations> {
		const model = await this.read(id);
		if (!model) {
			throw new NotFoundError(
				`${this.i18n.__("error.permitted_organization.name")} ${id} ${this.i18n.__("error.common.not_found")}`
			);
		}
		model.setAttributes(omitBy(params, isUndefined));

		return model.save();
	}

	public async delete(id: number): Promise<void> {
		const n = await PermittedOrganizations.destroy({ where: { id } });

		if (n === 0) {
			throw new NotFoundError(
				`${this.i18n.__("error.permitted_organization.name")} ${id} ${this.i18n.__("error.common.not_found")}`
			);
		}
	}
}
