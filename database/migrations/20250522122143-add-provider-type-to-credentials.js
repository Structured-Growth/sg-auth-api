"use strict";

const Sequelize = require("sequelize");

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface) {
		await queryInterface.addColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "credentials",
			},
			"provider_type",
			{
				type: Sequelize.STRING(100),
				allowNull: true,
			}
		);

		await queryInterface.sequelize.query(`
			UPDATE "${process.env.DB_SCHEMA}"."credentials"
			SET provider_type = CASE
				WHEN provider = 'local' THEN 'email'
				WHEN provider = 'google' THEN 'google'
				WHEN provider = 'github' THEN 'github'
				ELSE 'email'
			END
		`);

		await queryInterface.sequelize.query(`
			UPDATE "${process.env.DB_SCHEMA}"."credentials"
			SET provider = CASE
				WHEN provider = 'local' THEN 'local'
				ELSE 'oauth'
			END
		`);

		await queryInterface.changeColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "credentials",
			},
			"provider_type",
			{
				type: Sequelize.STRING(100),
				allowNull: false,
			}
		);
	},

	async down(queryInterface) {
		await queryInterface.removeColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "credentials",
			},
			"provider_type"
		);
	},
};
