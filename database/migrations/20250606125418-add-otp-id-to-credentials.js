"use strict";

const Sequelize = require("sequelize");

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface) {
		const table = {
			schema: process.env.DB_SCHEMA,
			tableName: "credentials",
		};

		await queryInterface.addColumn(table, "otp_id", {
			type: Sequelize.INTEGER,
			allowNull: true,
		});
	},

	async down(queryInterface) {
		const table = {
			schema: process.env.DB_SCHEMA,
			tableName: "credentials",
		};

		await queryInterface.removeColumn(table, "otp_id");
	},
};
