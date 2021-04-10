"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Bookmark extends Model {}

  Bookmark.init(
    {
      probeId: {
        type: DataTypes.STRING(32),
        allowNull: false
      },
      time: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    },
    { sequelize, timestamps: false }
  );

  return Bookmark;
};
