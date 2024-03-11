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
import { OAuthClientAttributes } from "../../../database/models/oauth-client";
import { OAuthClientSearchParamsInterface } from "../../interfaces/oauth-client-search-params.interface";
import { OAuthClientCreateBodyInterface } from "../../interfaces/oauth-client-create-body.interface";
import { OAuthClientUpdateBodyInterface } from "../../interfaces/oauth-client-update-body.interface";
import { OauthClientsRepository } from "../../modules/oauth-clients/oauth-clients.repository";
import { pick } from "lodash";
import { OAuthClientsSearchParamsValidator } from "../../validators/oauth-clients-search-params.validator";
import { OAuthClientCreateBodyValidator } from "../../validators/oauth-client-create-body.validator";
import { OAuthClientUpdateBodyValidator } from "../../validators/oauth-client-update-body.validator";

const publicOAuthClientAttributes = [
	"id",
	"orgId",
	"region",
	"accountId",
	"title",
	"defaultOrgName",
	"clientId",
	"status",
	"grants",
	"redirectUris",
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
	constructor(@inject("OauthClientsRepository") private oauthClientsRepository: OauthClientsRepository) {
		super();
	}

	/**
	 * Search OAuthClients
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of OAuth clients")
	@DescribeAction("oauth-client/search")
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
	@DescribeResource("Account", ({ query }) => Number(query.accountId))
	@ValidateFuncArgs(OAuthClientsSearchParamsValidator)
	async search(
		@Queries() query: OAuthClientSearchParamsInterface
	): Promise<SearchResultInterface<PublicOAuthClientAttributes>> {
		const { data, ...result } = await this.oauthClientsRepository.search(query);

		return {
			data: data.map((model) => ({
				...(pick(model.toJSON(), publicOAuthClientAttributes) as PublicOAuthClientAttributes),
				arn: model.arn,
			})),
			...result,
		};
	}

	/**
	 * Create OAuth client.
	 */
	@OperationId("Create")
	@Post("/")
	@SuccessResponse(201, "Returns created OAuth client")
	@DescribeAction("oauth-client/create")
	@DescribeResource("Organization", ({ body }) => Number(body.orgId))
	@DescribeResource("Account", ({ body }) => Number(body.accountId))
	@ValidateFuncArgs(OAuthClientCreateBodyValidator)
	async create(
		@Queries() query: {},
		@Body() body: OAuthClientCreateBodyInterface
	): Promise<
		PublicOAuthClientAttributes & {
			clientSecret: string;
		}
	> {
		const model = await this.oauthClientsRepository.create({
			accountId: body.accountId,
			orgId: body.orgId,
			region: body.region,
			status: body.status,
			title: body.title,
			defaultOrgName: body.defaultOrgName,
			grants: body.grants,
			redirectUris: body.redirectUris,
		});
		this.response.status(201);

		return {
			...(pick(model.toJSON(), publicOAuthClientAttributes) as PublicOAuthClientAttributes),
			arn: model.arn,
			clientSecret: model.clientSecretString,
		};
	}

	/**
	 * Get OAuth client info.
	 *
	 * Returns client secret as well.
	 */
	@OperationId("Read")
	@Get("/:oauthClientId")
	@SuccessResponse(200, "Returns client info")
	@DescribeAction("oauth-client/read")
	@DescribeResource("OAuthClient", ({ params }) => Number(params.oauthClientId))
	async get(@Path() oauthClientId: number): Promise<
		PublicOAuthClientAttributes & {
			clientSecret: string;
		}
	> {
		const model = await this.oauthClientsRepository.read(oauthClientId);

		if (!model) {
			throw new NotFoundError(`OAuthClient ${oauthClientId} not found`);
		}

		return {
			...(pick(model.toJSON(), publicOAuthClientAttributes) as PublicOAuthClientAttributes),
			clientSecret: model.clientSecretString,
			arn: model.arn,
		};
	}

	/**
	 * Update OAuth client
	 */
	@OperationId("Update")
	@Put("/:oauthClientId")
	@SuccessResponse(200, "Returns updated OAuth client")
	@DescribeAction("oauth-client/update")
	@DescribeResource("OAuthClient", ({ params }) => Number(params.oauthClientId))
	@ValidateFuncArgs(OAuthClientUpdateBodyValidator)
	async update(
		@Path() oauthClientId: number,
		@Queries() query: {},
		@Body() body: OAuthClientUpdateBodyInterface
	): Promise<PublicOAuthClientAttributes> {
		const model = await this.oauthClientsRepository.update(oauthClientId, body);

		return {
			...(pick(model.toJSON(), publicOAuthClientAttributes) as PublicOAuthClientAttributes),
			arn: model.arn,
		};
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
		await this.oauthClientsRepository.delete(oauthClientId);
		this.response.status(204);
	}
}
