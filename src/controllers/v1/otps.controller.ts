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
import { OTPsAttributes } from "../../../database/models/otps";
import { OTPsSearchParamsInterface } from "../../interfaces/otps-search-params.interface";
import { OTPsCreateBodyInterface } from "../../interfaces/otps-create-body.interface";
import { OTPsCheckBodyInterface } from "../../interfaces/otps-check-body.interface";
import { OTPsUpdateBodyInterface } from "../../interfaces/otps-update-body.interface";
import { inject, NotFoundError } from "@structured-growth/microservice-sdk";
import { OTPsRepository } from "../../modules/otps/otps.repository";
import { OTPsService } from "../../modules/otps/otps.service";
import { pick } from "lodash";
import { OTPsSearchParamsValidator } from "../../validators/otps-search-params.validator";
import { OTPsCreateBodyValidator } from "../../validators/otps-create-body.validator";
import { OTPsCheckBodyValidator } from "../../validators/otps-check-body.validator";
import { OTPsUpdateBodyValidator } from "../../validators/otps-update-body.validator";
import { EventMutation } from "@structured-growth/microservice-sdk";

const publicOTPsAttributes = [
	"id",
	"orgId",
	"region",
	"credentialId",
	"providerId",
	"lifeTime",
	"status",
	"createdAt",
	"updatedAt",
	"arn",
] as const;
type OTPsKeys = (typeof publicOTPsAttributes)[number];
type PublicOTPsAttributes = Pick<OTPsAttributes, OTPsKeys>;

@Route("v1/otps")
@Tags("OTPs")
@autoInjectable()
export class OTPsController extends BaseController {
	private i18n: I18nType;
	constructor(
		@inject("OTPsRepository") private otpsRepository: OTPsRepository,
		@inject("OTPsService") private otpsService: OTPsService,
		@inject("i18n") private getI18n: () => I18nType
	) {
		super();
		this.i18n = this.getI18n();
	}

	/**
	 * Search OTPs.
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of OTPs")
	@DescribeAction("otps/search")
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
	@ValidateFuncArgs(OTPsSearchParamsValidator)
	async search(@Queries() query: OTPsSearchParamsInterface): Promise<SearchResultInterface<PublicOTPsAttributes>> {
		const { data, ...result } = await this.otpsRepository.search(query);

		return {
			data: data.map((model) => ({
				...(pick(model.toJSON(), publicOTPsAttributes) as PublicOTPsAttributes),
				arn: model.arn,
			})),
			...result,
		};
	}

	/**
	 * Create OTP.
	 */
	@OperationId("Create")
	@Post("/")
	@SuccessResponse(201, "Returns created OTP")
	@DescribeAction("otps/create")
	@DescribeResource("Organization", ({ body }) => Number(body.orgId))
	@ValidateFuncArgs(OTPsCreateBodyValidator)
	async create(@Queries() query: {}, @Body() body: OTPsCreateBodyInterface): Promise<PublicOTPsAttributes> {
		const model = await this.otpsService.create(body);
		this.response.status(201);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, model.arn, `${this.appPrefix}:otps/create`, JSON.stringify(body))
		);

		return {
			...(pick(model.toJSON(), publicOTPsAttributes) as PublicOTPsAttributes),
			arn: model.arn,
		};
	}

	/**
	 * Check if OTP are valid.
	 */
	@OperationId("Check")
	@Put("/")
	@SuccessResponse(201, "Returns OTP info")
	@DescribeAction("otps/check")
	@DescribeResource("Organization", ({ body }) => Number(body.orgId))
	@ValidateFuncArgs(OTPsCheckBodyValidator)
	async check(@Queries() query: {}, @Body() body: OTPsCheckBodyInterface): Promise<PublicOTPsAttributes> {
		const model = await this.otpsService.check(body);

		return {
			...(pick(model.toJSON(), publicOTPsAttributes) as PublicOTPsAttributes),
			arn: model.arn,
		};
	}

	/**
	 * Get OTP
	 */
	@OperationId("Read")
	@Get("/:otpId")
	@SuccessResponse(200, "Returns OTP info")
	@DescribeAction("otps/read")
	@DescribeResource("OTP", ({ params }) => Number(params.otpId))
	async get(@Path() otpId: number): Promise<PublicOTPsAttributes> {
		const model = await this.otpsRepository.read(otpId);

		if (!model) {
			throw new NotFoundError(`${this.i18n.__("error.otp.name")} ${otpId} ${this.i18n.__("error.common.not_found")}`);
		}

		return {
			...(pick(model.toJSON(), publicOTPsAttributes) as PublicOTPsAttributes),
			arn: model.arn,
		};
	}

	/**
	 * Update OTP.
	 */
	@OperationId("Update")
	@Put("/:otpId")
	@SuccessResponse(200, "Returns updated OTP")
	@DescribeAction("otps/update")
	@DescribeResource("OTP", ({ params }) => Number(params.otpId))
	@ValidateFuncArgs(OTPsUpdateBodyValidator)
	async update(
		@Path() otpId: number,
		@Queries() query: {},
		@Body() body: OTPsUpdateBodyInterface
	): Promise<PublicOTPsAttributes> {
		const model = await this.otpsRepository.update(otpId, body);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, model.arn, `${this.appPrefix}:otps/update`, JSON.stringify(body))
		);

		return {
			...(pick(model.toJSON(), publicOTPsAttributes) as PublicOTPsAttributes),
			arn: model.arn,
		};
	}

	/**
	 * Mark OTP as deleted. Will be permanently deleted in 90 days.
	 */
	@OperationId("Delete")
	@Delete("/:otpId")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("otps/delete")
	@DescribeResource("OTP", ({ params }) => Number(params.otpId))
	async delete(@Path() otpId: number): Promise<void> {
		const model = await this.otpsRepository.read(otpId);

		if (!model) {
			throw new NotFoundError(`${this.i18n.__("error.otp.name")} ${otpId} ${this.i18n.__("error.common.not_found")}`);
		}

		await this.otpsRepository.delete(otpId);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, model.arn, `${this.appPrefix}:otps/delete`, JSON.stringify({}))
		);

		this.response.status(204);
	}
}
