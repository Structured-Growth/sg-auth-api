import { autoInjectable, inject, I18nType, NotFoundError } from "@structured-growth/microservice-sdk";
import PermittedOrganizations from "../../../database/models/permitted-organizations";
import { PermittedOrganizationCreateBodyInterface } from "../../interfaces/permitted-organization-create-body.interface";
import { PermittedOrganizationUpdateBodyInterface } from "../../interfaces/permitted-organization-update-body.interface";
import { CustomFieldService } from "../custom-fields/custom-field.service";
import { PermittedOrganizationsRepository } from "./permitted-organizations.repository";

@autoInjectable()
export class PermittedOrganizationsService {
	private i18n: I18nType;

	constructor(
		@inject("PermittedOrganizationsRepository")
		private permittedOrganizationsRepository: PermittedOrganizationsRepository,
		@inject("CustomFieldService") private customFieldService: CustomFieldService,
		@inject("i18n") private getI18n: () => I18nType
	) {
		this.i18n = this.getI18n();
	}

	public async create(
		params: PermittedOrganizationCreateBodyInterface,
		inheritedOrgIds: number[] = []
	): Promise<PermittedOrganizations> {
		await this.customFieldService.validate("PermittedOrganization", params.metadata, params.orgId, inheritedOrgIds);

		return this.permittedOrganizationsRepository.create({
			...params,
			metadata: params.metadata ?? null,
		});
	}

	public async update(
		id: number,
		params: PermittedOrganizationUpdateBodyInterface,
		inheritedOrgIds: number[] = []
	): Promise<PermittedOrganizations> {
		const model = await this.permittedOrganizationsRepository.read(id);

		if (!model) {
			throw new NotFoundError(
				`${this.i18n.__("error.permitted_organization.name")} ${id} ${this.i18n.__("error.common.not_found")}`
			);
		}

		const nextPermittedOrganization = {
			...model.toJSON(),
			...params,
			metadata: params.metadata !== undefined ? params.metadata : model.metadata,
		};

		await this.customFieldService.validate(
			"PermittedOrganization",
			nextPermittedOrganization.metadata,
			model.orgId,
			inheritedOrgIds
		);

		return this.permittedOrganizationsRepository.update(id, params);
	}
}
