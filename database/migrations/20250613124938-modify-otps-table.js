"use strict";

const Sequelize = require("sequelize");

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface) {
		await queryInterface.changeColumn({ schema: process.env.DB_SCHEMA, tableName: "otps" }, "code", {
			type: Sequelize.STRING(100),
		});

		await queryInterface.changeColumn({ schema: process.env.DB_SCHEMA, tableName: "otps" }, "provider_id", {
			type: Sequelize.STRING(100),
		});

		await queryInterface.addColumn({ schema: process.env.DB_SCHEMA, tableName: "otps" }, "provider_type", {
			type: Sequelize.STRING(100),
			allowNull: true,
		});

		await queryInterface.changeColumn({ schema: process.env.DB_SCHEMA, tableName: "otps" }, "credential_id", {
			type: Sequelize.INTEGER,
			allowNull: true,
			references: {
				model: {
					schema: process.env.DB_SCHEMA,
					tableName: "credentials",
				},
				key: "id",
			},
			onDelete: "RESTRICT",
		});

		await queryInterface.addIndex({ schema: process.env.DB_SCHEMA, tableName: "otps" }, ["provider_id"], {
			name: "otps_provider_id_idx",
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeIndex({ schema: process.env.DB_SCHEMA, tableName: "otps" }, "otps_provider_id_idx");

		await queryInterface.changeColumn({ schema: process.env.DB_SCHEMA, tableName: "otps" }, "code", {
			type: Sequelize.STRING,
		});

		await queryInterface.changeColumn({ schema: process.env.DB_SCHEMA, tableName: "otps" }, "provider_id", {
			type: Sequelize.STRING,
		});

		await queryInterface.changeColumn({ schema: process.env.DB_SCHEMA, tableName: "otps" }, "credential_id", {
			type: Sequelize.INTEGER,
			allowNull: true,
		});

		await queryInterface.removeColumn({ schema: process.env.DB_SCHEMA, tableName: "otps" }, "provider_type");
	},
};
