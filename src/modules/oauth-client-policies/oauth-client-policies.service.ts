import { autoInjectable, inject, I18nType } from "@structured-growth/microservice-sdk";
import { OauthClientPoliciesRepository } from "./oauth-client-policies.repository";

@autoInjectable()
export class OauthClientPoliciesService {
	private i18n: I18nType;
	constructor(
		@inject("OauthClientPoliciesRepository") private oauthClientPoliciesRepository: OauthClientPoliciesRepository,
		@inject("i18n") private getI18n: () => I18nType
	) {
		this.i18n = this.getI18n();
	}
}
