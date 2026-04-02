import { RegionEnum } from "@structured-growth/microservice-sdk";
export interface PermittedOrganizationCreateBodyInterface {
	orgId: number;
	region: RegionEnum;
	accountId: number;
	metadata?: Record<string, unknown>;
	status: "active" | "inactive";
}
