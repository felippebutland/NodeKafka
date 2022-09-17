const User = require('./user ');
import Sequelize from "sequelize";
const config = require('../config/config.json');
const models = [ User ];
class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(config);

    models
        .map(model => model.init(this.connection))
        .map(model => model.associate && model.associate(this.connection.models));
  }
}

export default new Database();