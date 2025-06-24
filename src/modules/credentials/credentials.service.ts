import { autoInjectable, inject, ValidationError, I18nType } from "@structured-growth/microservice-sdk";
import Credentials from "../../../database/models/credentials";
import { CredentialsRepository } from "./credentials.repository";
import { CredentialsCheckBodyInterface } from "../../interfaces/credentials-check-body.interface";
import { CredentialsCreateBodyInterface } from "../../interfaces/credentials-create-body.interface";

@autoInjectable()
export class CredentialsService {
	private i18n: I18nType;
	constructor(
		@inject("CredentialsRepository") private credentialsRepository: CredentialsRepository,
		@inject("i18n") private getI18n: () => I18nType
	) {
		this.i18n = this.getI18n();
	}

	public async create(params: CredentialsCreateBodyInterface): Promise<Credentials> {
		const result = await this.credentialsRepository.search({
			orgId: params.orgId,
			provider: params.provider,
			providerId: params.providerId,
		});

		if (result.total !== 0) {
			throw new ValidationError({}, this.i18n.__("error.credential.provider_id"));
		}

		return this.credentialsRepository.create({
			accountId: params.accountId,
			orgId: params.orgId,
			provider: params.provider,
			providerType: params.providerType,
			providerId: params.providerId,
			...(params.otpId && { otpId: params.otpId }),
			password: params.password,
			region: params.region,
			status: params.status || "verification",
		});
	}

	public async check(params: CredentialsCheckBodyInterface): Promise<Credentials> {
		const result = await this.credentialsRepository.search({
			orgId: params.orgId,
			provider: params.provider,
			providerId: params.providerId,
			status: ["active"],
		});
		const credentials = result.data[0];

		if (!credentials || result.data.length !== 1) {
			throw new ValidationError({}, this.i18n.__("error.credential.credentials_invalid"));
		}

		if (credentials.provider === "local" && !credentials.validatePassword(params.password)) {
			throw new ValidationError({}, this.i18n.__("error.credential.credentials_invalid"));
		}

		return credentials;
	}
}
