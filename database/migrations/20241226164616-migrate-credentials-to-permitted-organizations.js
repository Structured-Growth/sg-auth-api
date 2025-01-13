"use strict";

const Sequelize = require("sequelize");

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface) {
		const transaction = await queryInterface.sequelize.transaction();

		try {
			const credentials = await queryInterface.sequelize.query(
				`SELECT account_id, org_id, region, status FROM ${process.env.DB_SCHEMA}.credentials`,
				{ type: Sequelize.QueryTypes.SELECT }
			);

			for (const credential of credentials) {
				const { account_id, org_id, region } = credential;

				const existing = await queryInterface.sequelize.query(
					`SELECT id FROM ${process.env.DB_SCHEMA}.permitted_organizations WHERE account_id = :account_id AND org_id = :org_id AND region = :region`,
					{
						type: Sequelize.QueryTypes.SELECT,
						replacements: { account_id, org_id, region },
					}
				);

				if (existing.length === 0) {
					await queryInterface.sequelize.query(
						`INSERT INTO ${process.env.DB_SCHEMA}.permitted_organizations (account_id, org_id, region, status, created_at, updated_at) VALUES (:account_id, :org_id, :region, 'active', NOW(), NOW())`,
						{
							replacements: { account_id, org_id, region },
						}
					);
				}
			}

			await transaction.commit();
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	},

	async down(queryInterface) {},
};
