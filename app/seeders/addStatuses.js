module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.bulkInsert("Statuses", [
            {
                name: "To do",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "In progress",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Finish",
                createdAt: new Date(),
                updatedAt: new Date()
            },
        ]);
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable("Statuses");
    }
};
