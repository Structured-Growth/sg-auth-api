"use strict";

const Sequelize = require("sequelize");

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface) {
		const table = {
			schema: process.env.DB_SCHEMA,
			tableName: "credentials",
		};

		await queryInterface.addColumn(table, "verification_code_hash", {
			type: Sequelize.STRING,
			allowNull: true,
		});

		await queryInterface.addColumn(table, "verification_code_salt", {
			type: Sequelize.STRING,
			allowNull: true,
		});

		await queryInterface.addColumn(table, "verification_code_expires", {
			type: Sequelize.DATE,
			allowNull: true,
		});
	},

	async down(queryInterface) {
		const table = {
			schema: process.env.DB_SCHEMA,
			tableName: "credentials",
		};

		await queryInterface.removeColumn(table, "verification_code_expires");
		await queryInterface.removeColumn(table, "verification_code_salt");
		await queryInterface.removeColumn(table, "verification_code_hash");
	},
};
