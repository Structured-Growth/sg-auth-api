import { PermittedOrganizationsAttributes } from "../../database/models/permitted-organizations";

export interface PermittedOrganizationUpdateBodyInterface {
	status?: PermittedOrganizationsAttributes["status"];
}
