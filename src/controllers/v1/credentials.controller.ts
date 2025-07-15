import { Get, Route, Tags, Queries, OperationId, SuccessResponse, Body, Post, Path, Put, Delete } from "tsoa";
import {
	autoInjectable,
	BaseController,
	DescribeAction,
	DescribeResource,
	SearchResultInterface,
	ValidateFuncArgs,
	I18nType,
} from "@structured-growth/microservice-sdk";
import { CredentialsAttributes } from "../../../database/models/credentials";
import { CredentialsSearchParamsInterface } from "../../interfaces/credentials-search-params.interface";
import { CredentialsCreateBodyInterface } from "../../interfaces/credentials-create-body.interface";
import { CredentialsUpdateBodyInterface } from "../../interfaces/credentials-update-body.interface";
import { CredentialsCheckBodyInterface } from "../../interfaces/credentials-check-body.interface";
import { CredentialsChangePasswordBodyInterface } from "../../interfaces/credentials-change-password-body.interface";
import { inject, NotFoundError } from "@structured-growth/microservice-sdk";
import { CredentialsRepository } from "../../modules/credentials/credentials.repository";
import { CredentialsService } from "../../modules/credentials/credentials.service";
import { pick } from "lodash";
import { CredentialsSearchParamsValidator } from "../../validators/credentials-search-params.validator";
import { CredentialsCreateBodyValidator } from "../../validators/credentials-create-body.validator";
import { CredentialsCheckBodyValidator } from "../../validators/credentials-check-body.validator";
import { CredentialsUpdateBodyValidator } from "../../validators/credentials-update-body.validator";
import { CredentialsChangePasswordBodyValidator } from "../../validators/credentials-change-password-body.validator";
import { EventMutation } from "@structured-growth/microservice-sdk";

const publicCredentialsAttributes = [
	"id",
	"orgId",
	"region",
	"accountId",
	"provider",
	"providerType",
	"providerId",
	"status",
	"otpId",
	"createdAt",
	"updatedAt",
	"arn",
] as const;
type CredentialsKeys = (typeof publicCredentialsAttributes)[number];
type PublicCredentialsAttributes = Pick<CredentialsAttributes, CredentialsKeys> & {
	hasPassword: boolean;
};

@Route("v1/credentials")
@Tags("Credentials")
@autoInjectable()
export class CredentialsController extends BaseController {
	private i18n: I18nType;
	constructor(
		@inject("CredentialsRepository") private credentialsRepository: CredentialsRepository,
		@inject("CredentialsService") private credentialsService: CredentialsService,
		@inject("i18n") private getI18n: () => I18nType
	) {
		super();
		this.i18n = this.getI18n();
	}

	/**
	 * Search Credentials.
	 *
	 * Account may have different types of credentials:
	 * - email/password credentials (local provider);
	 * - provider/provider_id credentials (e.g. Google provider);
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of account credentials")
	@DescribeAction("credentials/search")
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
	@DescribeResource("Account", ({ query }) => Number(query.accountId))
	@ValidateFuncArgs(CredentialsSearchParamsValidator)
	async search(
		@Queries() query: CredentialsSearchParamsInterface
	): Promise<SearchResultInterface<PublicCredentialsAttributes>> {
		const { data, ...result } = await this.credentialsRepository.search(query);

		return {
			data: data.map((model) => ({
				...(pick(model.toJSON(), publicCredentialsAttributes) as PublicCredentialsAttributes),
				arn: model.arn,
				hasPassword: model.password !== null,
			})),
			...result,
		};
	}

	/**
	 * Create Credentials.
	 *
	 * They will be used for further authentication.
	 * Account may have the same credentials in different organizations.
	 */
	@OperationId("Create")
	@Post("/")
	@SuccessResponse(201, "Returns created credentials")
	@DescribeAction("credentials/create")
	@DescribeResource("Organization", ({ body }) => Number(body.orgId))
	@DescribeResource("Account", ({ body }) => Number(body.accountId))
	@ValidateFuncArgs(CredentialsCreateBodyValidator)
	async create(
		@Queries() query: {},
		@Body() body: CredentialsCreateBodyInterface
	): Promise<PublicCredentialsAttributes> {
		const model = await this.credentialsService.create(body);
		this.response.status(201);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, model.arn, `${this.appPrefix}:credentials/create`, JSON.stringify(body))
		);

		return {
			...(pick(model.toJSON(), publicCredentialsAttributes) as PublicCredentialsAttributes),
			arn: model.arn,
			hasPassword: model.password !== null,
		};
	}

	/**
	 * Check if Credentials are valid.
	 *
	 * Works only if credentials status is active.
	 */
	@OperationId("Check")
	@Put("/")
	@SuccessResponse(201, "Returns credentials info")
	@DescribeAction("credentials/check")
	@DescribeResource("Organization", ({ body }) => Number(body.orgId))
	@ValidateFuncArgs(CredentialsCheckBodyValidator)
	async check(@Queries() query: {}, @Body() body: CredentialsCheckBodyInterface): Promise<PublicCredentialsAttributes> {
		const model = await this.credentialsService.check(body);

		return {
			...(pick(model.toJSON(), publicCredentialsAttributes) as PublicCredentialsAttributes),
			arn: model.arn,
		};
	}

	/**
	 * Change Password.
	 */
	@OperationId("ChangePassword")
	@Post("/change-password/:credentialsId")
	@SuccessResponse(201, "Returns credential info")
	@DescribeAction("credentials/change-password")
	@DescribeResource("Credentials", ({ params }) => Number(params.credentialsId))
	@ValidateFuncArgs(CredentialsChangePasswordBodyValidator)
	async changePassword(
		@Path() credentialsId: number,
		@Queries() query: {},
		@Body() body: CredentialsChangePasswordBodyInterface
	): Promise<PublicCredentialsAttributes> {
		const model = await this.credentialsService.changePassword(credentialsId, body);
		this.response.status(201);

		await this.eventBus.publish(
			new EventMutation(
				this.principal.arn,
				model.arn,
				`${this.appPrefix}:credentials/changePassword`,
				JSON.stringify(body)
			)
		);

		return {
			...(pick(model.toJSON(), publicCredentialsAttributes) as PublicCredentialsAttributes),
			arn: model.arn,
			hasPassword: model.password !== null,
		};
	}

	/**
	 * Get Credentials
	 */
	@OperationId("Read")
	@Get("/:credentialsId")
	@SuccessResponse(200, "Returns credentials info")
	@DescribeAction("credentials/read")
	@DescribeResource("Credentials", ({ params }) => Number(params.credentialsId))
	async get(@Path() credentialsId: number): Promise<PublicCredentialsAttributes> {
		const model = await this.credentialsRepository.read(credentialsId);

		if (!model) {
			throw new NotFoundError(
				`${this.i18n.__("error.credential.name")} ${credentialsId} ${this.i18n.__("error.common.not_found")}`
			);
		}

		return {
			...(pick(model.toJSON(), publicCredentialsAttributes) as PublicCredentialsAttributes),
			arn: model.arn,
			hasPassword: model.password !== null,
		};
	}

	/**
	 * Update Credentials.
	 *
	 * Method may be used for changing password or inactivating auth method.
	 */
	@OperationId("Update")
	@Put("/:credentialsId")
	@SuccessResponse(200, "Returns updated credentials")
	@DescribeAction("credentials/update")
	@DescribeResource("Credentials", ({ params }) => Number(params.credentialsId))
	@ValidateFuncArgs(CredentialsUpdateBodyValidator)
	async update(
		@Path() credentialsId: number,
		@Queries() query: {},
		@Body() body: CredentialsUpdateBodyInterface
	): Promise<PublicCredentialsAttributes> {
		const model = await this.credentialsRepository.update(credentialsId, body);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, model.arn, `${this.appPrefix}:credentials/update`, JSON.stringify(body))
		);

		return {
			...(pick(model.toJSON(), publicCredentialsAttributes) as PublicCredentialsAttributes),
			arn: model.arn,
			hasPassword: model.password !== null,
		};
	}

	/**
	 * Mark Credentials as deleted. Will be permanently deleted in 90 days.
	 */
	@OperationId("Delete")
	@Delete("/:credentialsId")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("credentials/delete")
	@DescribeResource("Credentials", ({ params }) => Number(params.credentialsId))
	async delete(@Path() credentialsId: number): Promise<void> {
		const model = await this.credentialsRepository.read(credentialsId);

		if (!model) {
			throw new NotFoundError(
				`${this.i18n.__("error.credential.name")} ${credentialsId} ${this.i18n.__("error.common.not_found")}`
			);
		}

		await this.credentialsRepository.delete(credentialsId);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, model.arn, `${this.appPrefix}:credentials/delete`, JSON.stringify({}))
		);

		this.response.status(204);
	}
}
