import { autoInjectable, inject } from "@structured-growth/microservice-sdk";
import { PermittedOrganizationsRepository } from "./permitted-organizations.repository";

@autoInjectable()
export class PermittedOrganizationsService {
	constructor(
		@inject("PermittedOrganizationsRepository")
		private permittedOrganizationsRepository: PermittedOrganizationsRepository
	) {}
}
