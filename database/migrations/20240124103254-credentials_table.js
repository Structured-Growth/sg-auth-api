"use strict";

const Sequelize = require("sequelize");

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface) {
		await queryInterface.createSchema(process.env.DB_SCHEMA);

		await queryInterface.createTable(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "credentials",
			},
			{
				id: {
					type: Sequelize.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				org_id: Sequelize.INTEGER,
				region: Sequelize.STRING(10),
				account_id: Sequelize.INTEGER,
				provider: Sequelize.STRING(20),
				provider_id: Sequelize.STRING(100),
				password: Sequelize.STRING,
				status: Sequelize.STRING(15),
				created_at: Sequelize.DATE,
				updated_at: Sequelize.DATE,
				deleted_at: Sequelize.DATE,
			}
		);

		await queryInterface.addIndex(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "credentials",
			},
			{
				type: "UNIQUE",
				fields: ["org_id", "provider", "provider_id"],
			}
		);
	},

	async down(queryInterface) {
		await queryInterface.dropTable({
			schema: process.env.DB_SCHEMA,
			tableName: "credentials",
		});
	},
};
