import { joi, RegionEnum } from "@structured-growth/microservice-sdk";
import CustomField from "../../database/models/custom-field";
import { customFieldAlternativesSchema } from "./custom-field-schema";

export async function seedCustomField(
	orgId: number,
	entity: string,
	name = "externalRef",
	title = "External Ref"
): Promise<void> {
	await CustomField.findOrCreate({
		where: {
			orgId,
			entity,
			name,
		},
		defaults: {
			orgId,
			region: RegionEnum.US,
			entity,
			title,
			name,
			schema: joi.string().min(2).describe(),
			status: "active",
		},
	});
}

export async function seedCustomFieldWithSchema(
	orgId: number,
	entity: string,
	name: string,
	title: string,
	schema = customFieldAlternativesSchema
): Promise<void> {
	await CustomField.findOrCreate({
		where: {
			orgId,
			entity,
			name,
		},
		defaults: {
			orgId,
			region: RegionEnum.US,
			entity,
			title,
			name,
			schema,
			status: "active",
		},
	});
}
