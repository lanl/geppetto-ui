"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        "Bookmarks",
        {
          id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
          },
          probeId: {
            type: Sequelize.STRING(32),
            allowNull: false
          },
          time: {
            type: Sequelize.FLOAT,
            allowNull: false
          },
          comment: {
            type: Sequelize.TEXT,
            allowNull: false
          }
        },
        { transaction }
      );

      await queryInterface.addIndex("Bookmarks", {
        fields: ["probeId"],
        transaction
      });
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Bookmarks");
  }
};
