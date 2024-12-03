import { Get, Route, Tags, Queries, OperationId, SuccessResponse, Body, Post, Path, Put, Delete } from "tsoa";
import {
	autoInjectable,
	BaseController,
	DescribeAction,
	DescribeResource,
	inject,
	NotFoundError,
	SearchResultInterface,
	ValidateFuncArgs,
} from "@structured-growth/microservice-sdk";
import { PermittedOrganizationsAttributes } from "../../../database/models/permitted-organizations";
import { PermittedOrganizationsSearchParamsInterface } from "../../interfaces/permitted-organizations-search-params.interface";
import { PermittedOrganizationCreateBodyInterface } from "../../interfaces/permitted-organization-create-body.interface";
import { PermittedOrganizationUpdateBodyInterface } from "../../interfaces/permitted-organization-update-body.interface";
import { PermittedOrganizationsRepository } from "../../modules/permitted-organizations/permitted-organizations.repository";
import { pick } from "lodash";
import { PermittedOrganizationsSearchParamsValidator } from "../../validators/permitted-organizations-search-params.validator";
import { PermittedOrganizationCreateBodyValidator } from "../../validators/permitted-organization-create-body.validator";
import { PermittedOrganizationUpdateBodyValidator } from "../../validators/permitted-organization-update-body.validator";
import { PermittedOrganizationDeleteParamsValidator } from "../../validators/permitted-organization-delete-params.validator";
import { PermittedOrganizationReadParamsValidator } from "../../validators/permitted-organization-read-params.validator";
import { EventMutation } from "@structured-growth/microservice-sdk";

const publicPermittedOrganizationAttributes = [
	"id",
	"orgId",
	"region",
	"accountId",
	"status",
	"createdAt",
	"updatedAt",
	"arn",
] as const;
type PermittedOrganizationKeys = (typeof publicPermittedOrganizationAttributes)[number];
type PublicPermittedOrganizationAttributes = Pick<PermittedOrganizationsAttributes, PermittedOrganizationKeys>;

@Route("v1/permitted-organizations")
@Tags("Permitted Organizations")
@autoInjectable()
export class PermittedOrganizationController extends BaseController {
	constructor(
		@inject("PermittedOrganizationsRepository")
		private permittedOrganizationsRepository: PermittedOrganizationsRepository
	) {
		super();
	}

	/**
	 * Search Permitted Organizations
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of Permitted organizations")
	@DescribeAction("permitted-organizations/search")
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
	@DescribeResource("Account", ({ query }) => Number(query.accountId))
	@ValidateFuncArgs(PermittedOrganizationsSearchParamsValidator)
	async search(
		@Queries() query: PermittedOrganizationsSearchParamsInterface
	): Promise<SearchResultInterface<PublicPermittedOrganizationAttributes>> {
		const { data, ...result } = await this.permittedOrganizationsRepository.search(query);

		return {
			data: data.map((model) => ({
				...(pick(model.toJSON(), publicPermittedOrganizationAttributes) as PublicPermittedOrganizationAttributes),
				arn: model.arn,
			})),
			...result,
		};
	}

	/**
	 * Create Permitted organization.
	 */
	@OperationId("Create")
	@Post("/")
	@SuccessResponse(201, "Returns created Permitted organization")
	@DescribeAction("permitted-organizations/create")
	@DescribeResource("Organization", ({ body }) => Number(body.orgId))
	@DescribeResource("Account", ({ body }) => Number(body.accountId))
	@ValidateFuncArgs(PermittedOrganizationCreateBodyValidator)
	async create(
		@Queries() query: {},
		@Body() body: PermittedOrganizationCreateBodyInterface
	): Promise<PublicPermittedOrganizationAttributes> {
		const model = await this.permittedOrganizationsRepository.create(body);
		this.response.status(201);

		await this.eventBus.publish(
			new EventMutation(
				this.principal.arn,
				model.arn,
				`${this.appPrefix}:permitted-organizations/create`,
				JSON.stringify(body)
			)
		);

		return {
			...(pick(model.toJSON(), publicPermittedOrganizationAttributes) as PublicPermittedOrganizationAttributes),
			arn: model.arn,
		};
	}

	/**
	 * Get Permitted organization info.
	 */
	@OperationId("Read")
	@Get("/:permittedOrganizationId")
	@SuccessResponse(200, "Returns permitted organization info")
	@DescribeAction("permitted-organizations/read")
	@DescribeResource("PermittedOrganization", ({ params }) => Number(params.permittedOrganizationId))
	@ValidateFuncArgs(PermittedOrganizationReadParamsValidator)
	async get(@Path() permittedOrganizationId: number): Promise<PublicPermittedOrganizationAttributes> {
		const model = await this.permittedOrganizationsRepository.read(permittedOrganizationId);

		if (!model) {
			throw new NotFoundError(`Permitted organization ${permittedOrganizationId} not found`);
		}

		return {
			...(pick(model.toJSON(), publicPermittedOrganizationAttributes) as PublicPermittedOrganizationAttributes),
			arn: model.arn,
		};
	}

	/**
	 * Update Permitted organizations
	 */
	@OperationId("Update")
	@Put("/:permittedOrganizationId")
	@SuccessResponse(200, "Returns updated Permitted organization")
	@DescribeAction("permitted-organizations/update")
	@DescribeResource("PermittedOrganization", ({ params }) => Number(params.permittedOrganizationId))
	@ValidateFuncArgs(PermittedOrganizationUpdateBodyValidator)
	async update(
		@Path() permittedOrganizationId: number,
		@Queries() query: {},
		@Body() body: PermittedOrganizationUpdateBodyInterface
	): Promise<PublicPermittedOrganizationAttributes> {
		const model = await this.permittedOrganizationsRepository.update(permittedOrganizationId, body);

		await this.eventBus.publish(
			new EventMutation(
				this.principal.arn,
				model.arn,
				`${this.appPrefix}:permitted-organizations/update`,
				JSON.stringify(body)
			)
		);

		return {
			...(pick(model.toJSON(), publicPermittedOrganizationAttributes) as PublicPermittedOrganizationAttributes),
			arn: model.arn,
		};
	}

	/**
	 * Mark Permitted organization as deleted. Will be permanently deleted in 90 days.
	 */
	@OperationId("Delete")
	@Delete("/:permittedOrganizationId")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("permitted-organizations/delete")
	@DescribeResource("PermittedOrganization", ({ params }) => Number(params.permittedOrganizationId))
	@ValidateFuncArgs(PermittedOrganizationDeleteParamsValidator)
	async delete(@Path() permittedOrganizationId: number): Promise<void> {
		const model = await this.permittedOrganizationsRepository.read(permittedOrganizationId);

		if (!model) {
			throw new NotFoundError(`Permitted organization ${permittedOrganizationId} not found`);
		}

		await this.permittedOrganizationsRepository.delete(permittedOrganizationId);

		await this.eventBus.publish(
			new EventMutation(
				this.principal.arn,
				model.arn,
				`${this.appPrefix}:permitted-organizations/delete`,
				JSON.stringify({})
			)
		);

		this.response.status(204);
	}
}
