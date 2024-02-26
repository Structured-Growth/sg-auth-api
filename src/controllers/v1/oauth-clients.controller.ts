import { Get, Route, Tags, Queries, OperationId, SuccessResponse, Body, Post, Path, Put, Delete } from "tsoa";
import {
	autoInjectable,
	BaseController,
	DescribeAction,
	DescribeResource,
	SearchResultInterface,
} from "@structured-growth/microservice-sdk";
import { OAuthClientAttributes } from "../../../database/models/oauth-client";
import { OAuthClientSearchParamsInterface } from "../../interfaces/oauth-client-search-params.interface";
import { OAuthClientCreateBodyInterface } from "../../interfaces/oauth-client-create-body.interface";
import { OAuthClientUpdateBodyInterface } from "../../interfaces/oauth-client-update-body.interface";

const publicOAuthClientAttributes = [
	"id",
	"orgId",
	"region",
	"accountId",
	"title",
	"clientId",
	"status",
	"createdAt",
	"updatedAt",
	"arn",
] as const;
type OAuthClientKeys = (typeof publicOAuthClientAttributes)[number];
type PublicOAuthClientAttributes = Pick<OAuthClientAttributes, OAuthClientKeys>;

@Route("v1/oauth-clients")
@Tags("OAuth Clients")
@autoInjectable()
export class OAuthClientController extends BaseController {
	/**
	 * Search OAuthClients
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of OAuth clients")
	@DescribeAction("oauth-client/search")
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
	@DescribeResource("Account", ({ query }) => Number(query.accountId))
	async search(
		@Queries() query: OAuthClientSearchParamsInterface
	): Promise<SearchResultInterface<PublicOAuthClientAttributes>> {
		return undefined;
	}

	/**
	 * Create OAuth client.
	 *
	 * Client secret will be returned once on client creation. You will not be able to read it again.
	 */
	@OperationId("Create")
	@Post("/")
	@SuccessResponse(201, "Returns created OAuth client")
	@DescribeAction("oauth-client/create")
	@DescribeResource("Organization", ({ body }) => Number(body.orgId))
	@DescribeResource("Account", ({ body }) => Number(body.accountId))
	async create(
		@Queries() query: {},
		@Body() body: OAuthClientCreateBodyInterface
	): Promise<
		PublicOAuthClientAttributes & {
			clientSecret: string;
		}
	> {
		return undefined;
	}

	/**
	 * Get OAuth client info
	 */
	@OperationId("Read")
	@Get("/:oauthClientId")
	@SuccessResponse(200, "Returns client info")
	@DescribeAction("oauth-client/read")
	@DescribeResource("OAuthClient", ({ params }) => Number(params.oauthClientId))
	async get(@Path() oauthClientId: number): Promise<PublicOAuthClientAttributes> {
		return undefined;
	}

	/**
	 * Update OAuth client
	 */
	@OperationId("Update")
	@Put("/:oauthClientId")
	@SuccessResponse(200, "Returns updated OAuth client")
	@DescribeAction("oauth-client/update")
	@DescribeResource("OAuthClient", ({ params }) => Number(params.oauthClientId))
	async update(
		@Path() oauthClientId: number,
		@Queries() query: {},
		@Body() body: OAuthClientUpdateBodyInterface
	): Promise<PublicOAuthClientAttributes> {
		return undefined;
	}

	/**
	 * Mark OAuthClient as deleted. Will be permanently deleted in 90 days.
	 */
	@OperationId("Delete")
	@Delete("/:oauthClientId")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("oauth-client/delete")
	@DescribeResource("OAuthClient", ({ params }) => Number(params.oauthClientId))
	async delete(@Path() oauthClientId: number): Promise<void> {
		return undefined;
	}
}
