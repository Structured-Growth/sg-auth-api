"use strict";

const Sequelize = require("sequelize");

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface) {
		await queryInterface.createTable(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "oauth_client_policies",
			},
			{
				id: {
					type: Sequelize.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				org_id: Sequelize.INTEGER,
				region: Sequelize.STRING(10),
				oauth_client_id: Sequelize.STRING(100),
				provider_type: Sequelize.STRING(100),
				password_required: Sequelize.BOOLEAN,
				two_fa_enabled: Sequelize.BOOLEAN,
				status: Sequelize.STRING(15),
				created_at: Sequelize.DATE,
				updated_at: Sequelize.DATE,
				deleted_at: Sequelize.DATE,
			}
		);
	},

	async down(queryInterface) {
		await queryInterface.dropTable({
			schema: process.env.DB_SCHEMA,
			tableName: "oauth_client_policies",
		});
	},
};
