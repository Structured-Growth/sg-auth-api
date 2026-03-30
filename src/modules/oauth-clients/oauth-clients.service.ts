import { autoInjectable, inject, I18nType, NotFoundError } from "@structured-growth/microservice-sdk";
import OAuthClient from "../../../database/models/oauth-client";
import { OAuthClientCreateBodyInterface } from "../../interfaces/oauth-client-create-body.interface";
import { OAuthClientUpdateBodyInterface } from "../../interfaces/oauth-client-update-body.interface";
import { CustomFieldService } from "../custom-fields/custom-field.service";
import { OauthClientsRepository } from "./oauth-clients.repository";

@autoInjectable()
export class OauthClientsService {
	private i18n: I18nType;

	constructor(
		@inject("OauthClientsRepository") private oauthClientsRepository: OauthClientsRepository,
		@inject("CustomFieldService") private customFieldService: CustomFieldService,
		@inject("i18n") private getI18n: () => I18nType
	) {
		this.i18n = this.getI18n();
	}

	public async create(params: OAuthClientCreateBodyInterface, inheritedOrgIds: number[] = []): Promise<OAuthClient> {
		await this.customFieldService.validate("OAuthClient", params.metadata, params.orgId, inheritedOrgIds);

		return this.oauthClientsRepository.create({
			accountId: params.accountId,
			orgId: params.orgId,
			region: params.region,
			status: params.status || "active",
			title: params.title,
			defaultOrgName: params.defaultOrgName,
			grants: params.grants,
			redirectUris: params.redirectUris,
			metadata: params.metadata ?? null,
		});
	}

	public async update(
		id: number,
		params: OAuthClientUpdateBodyInterface,
		inheritedOrgIds: number[] = []
	): Promise<OAuthClient> {
		const model = await this.oauthClientsRepository.read(id);

		if (!model) {
			throw new NotFoundError(
				`${this.i18n.__("error.oauth_client.name")} ${id} ${this.i18n.__("error.common.not_found")}`
			);
		}

		const nextOAuthClient = {
			...model.toJSON(),
			...params,
			metadata: params.metadata !== undefined ? params.metadata : model.metadata,
		};

		await this.customFieldService.validate("OAuthClient", nextOAuthClient.metadata, model.orgId, inheritedOrgIds);

		return this.oauthClientsRepository.update(id, params);
	}
}
