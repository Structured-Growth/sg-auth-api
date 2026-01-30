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
	I18nType,
	HashFields,
} from "@structured-growth/microservice-sdk";
import { OAuthClientPolicyAttributes } from "../../../database/models/oauth-client-policy";
import { OAuthClientPoliciesSearchParamsInterface } from "../../interfaces/oauth-client-policies-search-params.interface";
import { OAuthClientPolicyCreateBodyInterface } from "../../interfaces/oauth-client-policy-create-body.interface";
import { OAuthClientPolicyUpdateBodyInterface } from "../../interfaces/oauth-client-policy-update-body.interface";
import { OauthClientPoliciesRepository } from "../../modules/oauth-client-policies/oauth-client-policies.repository";
import { pick } from "lodash";
import { OAuthClientPoliciesSearchParamsValidator } from "../../validators/oauth-client-policies-search-params.validator";
import { OAuthClientPolicyCreateBodyValidator } from "../../validators/oauth-client-policy-create-body.validator";
import { OAuthClientPolicyUpdateBodyValidator } from "../../validators/oauth-client-policy-update-body.validator";
import { EventMutation } from "@structured-growth/microservice-sdk";

const publicOAuthClientPolicyAttributes = [
	"id",
	"orgId",
	"region",
	"oauthClientId",
	"providerType",
	"passwordRequired",
	"twoFaEnabled",
	"status",
	"createdAt",
	"updatedAt",
	"arn",
] as const;
type OAuthClientPolicyKeys = (typeof publicOAuthClientPolicyAttributes)[number];
type PublicOAuthClientPolicyAttributes = Pick<OAuthClientPolicyAttributes, OAuthClientPolicyKeys>;

@Route("v1/oauth-client-policies")
@Tags("OAuth Clients Policies")
@autoInjectable()
export class OAuthClientPolicyController extends BaseController {
	private i18n: I18nType;
	constructor(
		@inject("OauthClientPoliciesRepository") private oauthClientPoliciesRepository: OauthClientPoliciesRepository,
		@inject("i18n") private getI18n: () => I18nType
	) {
		super();
		this.i18n = this.getI18n();
	}

	/**
	 * Search OAuthClientPolicies
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of OAuth client policies")
	@DescribeAction("oauth-client-policies/search")
	@DescribeResource("Organization", ({ query }) => [Number(query.orgId)])
	@DescribeResource("OauthClient", ({ query }) => [Number(query.oauthClientId)])
	@HashFields(["providerType"])
	@ValidateFuncArgs(OAuthClientPoliciesSearchParamsValidator)
	async search(
		@Queries() query: OAuthClientPoliciesSearchParamsInterface
	): Promise<SearchResultInterface<PublicOAuthClientPolicyAttributes>> {
		const { data, ...result } = await this.oauthClientPoliciesRepository.search(query);

		return {
			data: data.map((model) => ({
				...(pick(model.toJSON(), publicOAuthClientPolicyAttributes) as PublicOAuthClientPolicyAttributes),
				arn: model.arn,
			})),
			...result,
		};
	}

	/**
	 * Create OAuth client policy.
	 */
	@OperationId("Create")
	@Post("/")
	@SuccessResponse(201, "Returns created OAuth client")
	@DescribeAction("oauth-client-policies/create")
	@DescribeResource("Organization", ({ body }) => [Number(body.orgId)])
	@DescribeResource("OauthClient", ({ body }) => [Number(body.oauthClientId)])
	@HashFields(["providerType"])
	@ValidateFuncArgs(OAuthClientPolicyCreateBodyValidator)
	async create(
		@Queries() query: {},
		@Body() body: OAuthClientPolicyCreateBodyInterface
	): Promise<PublicOAuthClientPolicyAttributes> {
		const model = await this.oauthClientPoliciesRepository.create({
			orgId: body.orgId,
			region: body.region,
			oauthClientId: body.oauthClientId,
			providerType: body.providerType,
			passwordRequired: body.passwordRequired,
			twoFaEnabled: body.twoFaEnabled,
			status: body.status || "active",
		});
		this.response.status(201);

		await this.eventBus.publish(
			new EventMutation(
				this.principal.arn,
				model.arn,
				`${this.appPrefix}:oauth-client-policy/create`,
				JSON.stringify(body)
			)
		);

		return {
			...(pick(model.toJSON(), publicOAuthClientPolicyAttributes) as PublicOAuthClientPolicyAttributes),
			arn: model.arn,
		};
	}

	/**
	 * Get OAuth client policy info.
	 */
	@OperationId("Read")
	@Get("/:oauthClientPolicyId")
	@SuccessResponse(200, "Returns client policy info")
	@DescribeAction("oauth-client-policies/read")
	@DescribeResource("OAuthClientPolicy", ({ params }) => [Number(params.oauthClientPolicyId)])
	@HashFields(["providerType"])
	async get(@Path() oauthClientPolicyId: number): Promise<PublicOAuthClientPolicyAttributes> {
		const model = await this.oauthClientPoliciesRepository.read(oauthClientPolicyId);

		if (!model) {
			throw new NotFoundError(
				`${this.i18n.__("error.oauth_client_policy.name")} ${oauthClientPolicyId} ${this.i18n.__(
					"error.common.not_found"
				)}`
			);
		}

		return {
			...(pick(model.toJSON(), publicOAuthClientPolicyAttributes) as PublicOAuthClientPolicyAttributes),
			arn: model.arn,
		};
	}

	/**
	 * Update OAuth client policy
	 */
	@OperationId("Update")
	@Put("/:oauthClientPolicyId")
	@SuccessResponse(200, "Returns updated OAuth client policy")
	@DescribeAction("oauth-client-policies/update")
	@DescribeResource("OAuthClientPolicy", ({ params }) => [Number(params.oauthClientPolicyId)])
	@HashFields(["providerType"])
	@ValidateFuncArgs(OAuthClientPolicyUpdateBodyValidator)
	async update(
		@Path() oauthClientPolicyId: number,
		@Queries() query: {},
		@Body() body: OAuthClientPolicyUpdateBodyInterface
	): Promise<PublicOAuthClientPolicyAttributes> {
		const model = await this.oauthClientPoliciesRepository.update(oauthClientPolicyId, body);

		await this.eventBus.publish(
			new EventMutation(
				this.principal.arn,
				model.arn,
				`${this.appPrefix}:oauth-client-policy/update`,
				JSON.stringify(body)
			)
		);

		return {
			...(pick(model.toJSON(), publicOAuthClientPolicyAttributes) as PublicOAuthClientPolicyAttributes),
			arn: model.arn,
		};
	}

	/**
	 * Mark OAuthClientPolicy as deleted. Will be permanently deleted in 90 days.
	 */
	@OperationId("Delete")
	@Delete("/:oauthClientPolicyId")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("oauth-client-policies/delete")
	@DescribeResource("OAuthClientPolicy", ({ params }) => [Number(params.oauthClientPolicyId)])
	async delete(@Path() oauthClientPolicyId: number): Promise<void> {
		const model = await this.oauthClientPoliciesRepository.read(oauthClientPolicyId);

		if (!model) {
			throw new NotFoundError(
				`${this.i18n.__("error.oauth_client_policy.name")} ${oauthClientPolicyId} ${this.i18n.__(
					"error.common.not_found"
				)}`
			);
		}

		await this.oauthClientPoliciesRepository.delete(oauthClientPolicyId);

		await this.eventBus.publish(
			new EventMutation(
				this.principal.arn,
				model.arn,
				`${this.appPrefix}:oauth-client-policy/delete`,
				JSON.stringify({})
			)
		);

		this.response.status(204);
	}
}
