import { autoInjectable, inject, I18nType } from "@structured-growth/microservice-sdk";
import { NotFoundError } from "@structured-growth/microservice-sdk";
import OauthClientPolicy from "../../../database/models/oauth-client-policy";
import { OAuthClientPolicyCreateBodyInterface } from "../../interfaces/oauth-client-policy-create-body.interface";
import { OAuthClientPolicyUpdateBodyInterface } from "../../interfaces/oauth-client-policy-update-body.interface";
import { CustomFieldService } from "../custom-fields/custom-field.service";
import { OauthClientPoliciesRepository } from "./oauth-client-policies.repository";

@autoInjectable()
export class OauthClientPoliciesService {
	private i18n: I18nType;
	constructor(
		@inject("OauthClientPoliciesRepository") private oauthClientPoliciesRepository: OauthClientPoliciesRepository,
		@inject("CustomFieldService") private customFieldService: CustomFieldService,
		@inject("i18n") private getI18n: () => I18nType
	) {
		this.i18n = this.getI18n();
	}

	public async create(
		params: OAuthClientPolicyCreateBodyInterface,
		inheritedOrgIds: number[] = []
	): Promise<OauthClientPolicy> {
		await this.customFieldService.validate("OAuthClientPolicy", params.metadata, params.orgId, inheritedOrgIds);

		return this.oauthClientPoliciesRepository.create({
			orgId: params.orgId,
			region: params.region,
			oauthClientId: params.oauthClientId,
			providerType: params.providerType,
			passwordRequired: params.passwordRequired,
			twoFaEnabled: params.twoFaEnabled,
			metadata: params.metadata ?? null,
			status: params.status || "active",
		});
	}

	public async update(
		id: number,
		params: OAuthClientPolicyUpdateBodyInterface,
		inheritedOrgIds: number[] = []
	): Promise<OauthClientPolicy> {
		const model = await this.oauthClientPoliciesRepository.read(id);

		if (!model) {
			throw new NotFoundError(
				`${this.i18n.__("error.oauth_client_policy.name")} ${id} ${this.i18n.__("error.common.not_found")}`
			);
		}

		const nextPolicy = {
			...model.toJSON(),
			...params,
			metadata: params.metadata !== undefined ? params.metadata : model.metadata,
		};

		await this.customFieldService.validate("OAuthClientPolicy", nextPolicy.metadata, model.orgId, inheritedOrgIds);

		return this.oauthClientPoliciesRepository.update(id, params);
	}
}
