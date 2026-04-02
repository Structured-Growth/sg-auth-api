import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { PermittedOrganizationsAttributes } from "../../database/models/permitted-organizations";

export interface PermittedOrganizationsSearchParamsInterface
	extends Omit<DefaultSearchParamsInterface, "orgId" | "accountId"> {
	orgId?: number;
	accountId?: number[];
	status?: PermittedOrganizationsAttributes["status"][];
	/**
	 * Search by custom entity fields.
	 * Example: metadata[externalRef]=PO-11
	 */
	"metadata[customFieldName]"?: string;
}
