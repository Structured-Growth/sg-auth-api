import { autoInjectable, inject, ValidationError } from "@structured-growth/microservice-sdk";
import Credentials from "../../../database/models/credentials";
import { CredentialsRepository } from "./credentials.repository";
import { CredentialsCheckBodyInterface } from "../../interfaces/credentials-check-body.interface";
import { CredentialsCreateBodyInterface } from "../../interfaces/credentials-create-body.interface";

@autoInjectable()
export class CredentialsService {
	constructor(@inject("CredentialsRepository") private credentialsRepository: CredentialsRepository) {}

	public async create(params: CredentialsCreateBodyInterface): Promise<Credentials> {
		const result = await this.credentialsRepository.search({
			orgId: params.orgId,
			provider: params.provider,
			providerId: params.providerId,
		});

		if (result.total !== 0) {
			throw new ValidationError({
				providerId: "Provider ID is already taken",
			});
		}

		return this.credentialsRepository.create({
			accountId: params.accountId,
			orgId: params.orgId,
			provider: params.provider,
			providerId: params.providerId,
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
		});
		const credentials = result.data[0];

		if (!credentials || result.data.length !== 1) {
			throw new ValidationError({
				providerId: "Credentials are invalid",
			});
		}

		if (credentials.provider === "local" && !credentials.validatePassword(params.password)) {
			throw new ValidationError({
				providerId: "Credentials are invalid",
			});
		}

		return credentials;
	}
}
