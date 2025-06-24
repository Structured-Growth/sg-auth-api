import { autoInjectable, inject, I18nType, ValidationError } from "@structured-growth/microservice-sdk";
import { OTPsRepository } from "./otps.repository";
import { OTPsCreateBodyInterface } from "../../interfaces/otps-create-body.interface";
import { OTPsCheckBodyInterface } from "../../interfaces/otps-check-body.interface";
import OTPs from "../../../database/models/otps";

@autoInjectable()
export class OTPsService {
	private i18n: I18nType;
	constructor(
		@inject("OTPsRepository") private otpsRepository: OTPsRepository,
		@inject("i18n") private getI18n: () => I18nType
	) {
		this.i18n = this.getI18n();
	}

	public async create(params: OTPsCreateBodyInterface): Promise<OTPs> {
		const result = await this.otpsRepository.search({
			orgId: params.orgId,
			providerType: params.providerType,
			providerId: params.providerId,
		});

		if (result.total !== 0) {
			await Promise.all(result.data.map((otp) => this.otpsRepository.update(otp.id, { status: "archived" })));
		}

		return this.otpsRepository.create({
			orgId: params.orgId,
			region: params.region,
			...(params.credentialId && { credentialId: params.credentialId }),
			providerId: params.providerId,
			providerType: params.providerType,
			code: params.code,
			lifeTime: params.lifeTime,
			status: params.status,
		});
	}

	public async check(params: OTPsCheckBodyInterface): Promise<OTPs> {
		const result = await this.otpsRepository.search({
			orgId: params.orgId,
			providerId: params.providerId,
			providerType: params.providerType,
			status: ["active"],
		});
		const otp = result.data[0];

		if (!otp || result.data.length !== 1) {
			throw new ValidationError({}, this.i18n.__("error.otp.code_invalid"));
		}

		const createdAt = new Date(otp.createdAt).getTime();
		const now = Date.now();
		const lifeTimeMs = otp.lifeTime * 60_000;

		if (now > createdAt + lifeTimeMs) {
			throw new ValidationError({}, this.i18n.__("error.otp.code_expired"));
		}

		if (!otp.validateCode(params.code)) {
			throw new ValidationError({}, this.i18n.__("error.otp.code_invalid"));
		}

		return await this.otpsRepository.update(otp.id, {
			status: "archived",
		});
	}
}
