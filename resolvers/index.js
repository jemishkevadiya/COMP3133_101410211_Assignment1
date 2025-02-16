const userResolver = require("./userResolver");
const employeeResolver = require("./employeeResolver");

const resolvers = {
    Query: {
        ...userResolver.Query,
        ...employeeResolver.Query,
    },
    Mutation: {
        ...userResolver.Mutation,
        ...employeeResolver.Mutation,
    }
};

module.exports = resolvers;
