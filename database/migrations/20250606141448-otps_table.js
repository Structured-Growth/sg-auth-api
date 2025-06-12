"use strict";

const Sequelize = require("sequelize");

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface) {
		await queryInterface.createTable(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "otps",
			},
			{
				id: {
					type: Sequelize.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				org_id: Sequelize.INTEGER,
				region: Sequelize.STRING(10),
				credential_id: {
					type: Sequelize.INTEGER,
					allowNull: true,
				},
				provider_id: Sequelize.STRING(),
				code: Sequelize.STRING(),
				life_time: Sequelize.INTEGER(),
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
			tableName: "otps",
		});
	},
};
