import { RegionEnum } from "@structured-growth/microservice-sdk";
export interface PermittedOrganizationCreateBodyInterface {
	orgId: number;
	region: RegionEnum;
	accountId: number;
	status: "active" | "inactive";
}
