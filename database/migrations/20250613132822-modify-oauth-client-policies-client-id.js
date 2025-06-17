"use strict";

const Sequelize = require("sequelize");

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface, SequelizeLib) {
		const schema = process.env.DB_SCHEMA;

		await queryInterface.sequelize.transaction(async (t) => {
			await queryInterface.addColumn(
				{ schema, tableName: "oauth_client_policies" },
				"oauth_client_id_new",
				{
					type: Sequelize.INTEGER,
					allowNull: true,
				},
				{ transaction: t }
			);

			await queryInterface.sequelize.query(
				`
					UPDATE "${schema}"."oauth_client_policies" p
					SET    oauth_client_id_new = c.id
					FROM   "${schema}"."oauth_clients" c
					WHERE  c.client_id = p.oauth_client_id
				`,
				{ transaction: t }
			);

			await queryInterface.sequelize.query(
				`
					DELETE FROM "${schema}"."oauth_client_policies" p
					WHERE NOT EXISTS (
						SELECT 1 FROM "${schema}"."oauth_clients" c
						WHERE c.id = p.oauth_client_id_new
					)
				`,
				{ transaction: t }
			);

			await queryInterface.changeColumn(
				{ schema, tableName: "oauth_client_policies" },
				"oauth_client_id_new",
				{
					type: Sequelize.INTEGER,
					allowNull: false,
				},
				{ transaction: t }
			);

			await queryInterface.removeColumn({ schema, tableName: "oauth_client_policies" }, "oauth_client_id", {
				transaction: t,
			});

			await queryInterface.renameColumn(
				{ schema, tableName: "oauth_client_policies" },
				"oauth_client_id_new",
				"oauth_client_id",
				{ transaction: t }
			);

			await queryInterface.changeColumn(
				{ schema, tableName: "oauth_client_policies" },
				"oauth_client_id",
				{
					type: Sequelize.INTEGER,
					allowNull: false,
					references: {
						model: {
							schema,
							tableName: "oauth_clients",
						},
						key: "id",
					},
					onDelete: "RESTRICT",
				},
				{ transaction: t }
			);
		});
	},

	async down(queryInterface, SequelizeLib) {
		const schema = process.env.DB_SCHEMA;

		await queryInterface.sequelize.transaction(async (t) => {
			await queryInterface.removeConstraint(
				{ schema, tableName: "oauth_client_policies" },
				"oauth_client_policies_oauth_client_id_fkey",
				{ transaction: t }
			);

			await queryInterface.addColumn(
				{ schema, tableName: "oauth_client_policies" },
				"oauth_client_id_old",
				{
					type: Sequelize.STRING(100),
					allowNull: true,
				},
				{ transaction: t }
			);

			await queryInterface.sequelize.query(
				`
					UPDATE "${schema}"."oauth_client_policies" p
					SET    oauth_client_id_old = c.client_id
					FROM   "${schema}"."oauth_clients" c
					WHERE  c.id = p.oauth_client_id
				`,
				{ transaction: t }
			);

			await queryInterface.changeColumn(
				{ schema, tableName: "oauth_client_policies" },
				"oauth_client_id_old",
				{
					type: Sequelize.STRING(100),
					allowNull: false,
				},
				{ transaction: t }
			);

			await queryInterface.removeColumn({ schema, tableName: "oauth_client_policies" }, "oauth_client_id", {
				transaction: t,
			});

			await queryInterface.renameColumn(
				{ schema, tableName: "oauth_client_policies" },
				"oauth_client_id_old",
				"oauth_client_id",
				{ transaction: t }
			);
		});
	},
};
