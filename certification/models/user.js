'use strict';
import Sequelize, {Model} from "sequelize";

class User extends Model {
  static init(sequelize) {
    super.init({
      firstName: Sequelize.STRING,
      course: Sequelize.STRING
    }, {
      sequelize,
      modelName: 'Users',
      timestamps: true,
      freezeTableName: true,
    });

    return this;
  }
}

export default User