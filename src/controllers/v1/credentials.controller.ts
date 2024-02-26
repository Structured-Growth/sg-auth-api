import { Get, Route, Tags, Queries, OperationId, SuccessResponse, Body, Post, Path, Put, Delete } from "tsoa";
import {
	autoInjectable,
	BaseController,
	DescribeAction,
	DescribeResource,
	SearchResultInterface,
} from "@structured-growth/microservice-sdk";
import { CredentialsAttributes } from "../../../database/models/credentials";
import { CredentialsSearchParamsInterface } from "../../interfaces/credentials-search-params.interface";
import { CredentialsCreateBodyInterface } from "../../interfaces/credentials-create-body.interface";
import { CredentialsUpdateBodyInterface } from "../../interfaces/credentials-update-body.interface";
import { CredentialsCheckBodyInterface } from "../../interfaces/credentials-check-body.interface";

const publicCredentialsAttributes = [
	"id",
	"orgId",
	"region",
	"accountId",
	"provider",
	"providerId",
	"status",
	"createdAt",
	"updatedAt",
	"arn",
] as const;
type CredentialsKeys = (typeof publicCredentialsAttributes)[number];
type PublicCredentialsAttributes = Pick<CredentialsAttributes, CredentialsKeys>;

@Route("v1/credentials")
@Tags("Credentials")
@autoInjectable()
export class CredentialsController extends BaseController {
	/**
	 * Search Credentials
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of account credentials")
	@DescribeAction("credentials/search")
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
	@DescribeResource("Account", ({ query }) => Number(query.accountId))
	async search(@Queries() query: CredentialsSearchParamsInterface): Promise<SearchResultInterface<PublicCredentialsAttributes>> {
		return undefined;
	}

	/**
	 * Create Credentials.
	 */
	@OperationId("Create")
	@Post("/")
	@SuccessResponse(201, "Returns created credentials")
	@DescribeAction("credentials/create")
	@DescribeResource("Organization", ({ body }) => Number(body.orgId))
	@DescribeResource("Account", ({ body }) => Number(body.accountId))
	async create(@Queries() query: {}, @Body() body: CredentialsCreateBodyInterface): Promise<PublicCredentialsAttributes> {
		return undefined;
	}

	/**
	 * Check if Credentials are valid
	 */
	@OperationId("Check")
	@Put("/")
	@SuccessResponse(201, "Returns credentials info")
	@DescribeAction("credentials/check")
	@DescribeResource("Organization", ({ body }) => Number(body.orgId))
	async check(@Queries() query: {}, @Body() body: CredentialsCheckBodyInterface): Promise<PublicCredentialsAttributes & {
		jwt: string;
	}> {
		return undefined;
	}


	/**
	 * Get Credentials
	 */
	@OperationId("Read")
	@Get("/:credentialsId")
	@SuccessResponse(200, "Returns crendentials info")
	@DescribeAction("credentials/read")
	@DescribeResource("Credentials", ({ params }) => Number(params.credentialsId))
	async get(@Path() credentialsId: number): Promise<PublicCredentialsAttributes> {
		return undefined;
	}

	/**
	 * Update Credentials
	 */
	@OperationId("Update")
	@Put("/:credentialsId")
	@SuccessResponse(200, "Returns updated credentials")
	@DescribeAction("credentials/update")
	@DescribeResource("Credentials", ({ params }) => Number(params.credentialsId))
	async update(
		@Path() credentialsId: number,
		@Queries() query: {},
		@Body() body: CredentialsUpdateBodyInterface,
	): Promise<PublicCredentialsAttributes> {
		return undefined;
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
		return undefined;
	}
}
