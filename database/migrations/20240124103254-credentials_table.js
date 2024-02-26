"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("credentials", {
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
		});

		await queryInterface.addIndex("credentials", {
			type: "UNIQUE",
			fields: ["org_id", "provider", "provider_id"]
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("credentials");
	},
};
