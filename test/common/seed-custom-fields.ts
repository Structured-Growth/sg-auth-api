import { joi, RegionEnum } from "@structured-growth/microservice-sdk";
import CustomField from "../../database/models/custom-field";

export async function seedCustomField(
	orgId: number,
	entity: string,
	name = "externalRef",
	title = "External Ref"
): Promise<void> {
	await CustomField.create({
		orgId,
		region: RegionEnum.US,
		entity,
		title,
		name,
		schema: joi.string().min(2).describe(),
		status: "active",
	});
}
