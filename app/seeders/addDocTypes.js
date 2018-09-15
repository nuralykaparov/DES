module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.bulkInsert("DocTypes", [
            {
                name: "Memoranda",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Agendas",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Reports",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Letters",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Proposals",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Press releases",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Documentation",
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable("DocTypes");
    }
};
