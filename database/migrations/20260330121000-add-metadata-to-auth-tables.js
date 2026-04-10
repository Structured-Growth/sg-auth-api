"use strict";

const Sequelize = require("sequelize");

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface) {
		for (const tableName of [
			"credentials",
			"oauth_clients",
			"oauth_client_policies",
			"otps",
			"permitted_organizations",
		]) {
			await queryInterface.addColumn(
				{
					schema: process.env.DB_SCHEMA,
					tableName,
				},
				"metadata",
				{
					type: Sequelize.JSONB,
					allowNull: false,
					defaultValue: {},
				}
			);
		}
	},

	async down(queryInterface) {
		for (const tableName of [
			"permitted_organizations",
			"otps",
			"oauth_client_policies",
			"oauth_clients",
			"credentials",
		]) {
			await queryInterface.removeColumn(
				{
					schema: process.env.DB_SCHEMA,
					tableName,
				},
				"metadata"
			);
		}
	},
};
