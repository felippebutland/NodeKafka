const { Sequelize} = require('sequelize');

const sequelize = new Sequelize('database', null, null, {
    dialect: 'postgres',
    port: 3306,
    replication: {
        read: [
            { host: '8.8.8.8', username: 'read-username', password: '12345' }
        ],
        write: { host: '1.1.1.1', username: 'write-username', password: '12345' }
    },
    pool: { // If you want to override the options used for the read/write pool you can do so here
        max: 20,
        idle: 30000
    },
})

export default sequelize;
