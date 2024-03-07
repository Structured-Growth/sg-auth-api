"use strict";

const Sequelize = require("sequelize");

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface) {
		await queryInterface.createTable("oauth_clients", {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			org_id: Sequelize.INTEGER,
			region: Sequelize.STRING(10),
			account_id: Sequelize.INTEGER,
			title: {
				type: Sequelize.STRING(100),
				allowNull: false,
			},
			default_org_name: Sequelize.STRING(100),
			client_id: {
				type: Sequelize.STRING(100),
				allowNull: false,
			},
			client_secret_hash: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			client_secret_hash_iv: {
				type: Sequelize.STRING(100),
				allowNull: false,
			},
			grants: Sequelize.JSON,
			redirect_uris: Sequelize.JSON,
			status: Sequelize.STRING(15),
			created_at: Sequelize.DATE,
			updated_at: Sequelize.DATE,
			deleted_at: Sequelize.DATE,
		});

		await queryInterface.addIndex("oauth_clients", {
			type: "UNIQUE",
			fields: ["client_id"],
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable("oauth_clients");
	},
};
