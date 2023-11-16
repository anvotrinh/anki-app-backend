import mongoose from "mongoose";
import "./entity";

let _dbInfo = undefined;

export default {
  initialize: async function({ host, port, database }) {
    try {
      const url = `mongodb://${host}:${port}/${database}`;
      mongoose.Promise = global.Promise;
      await mongoose.connect(url, {
        autoIndex: false,
        useMongoClient: true,
        poolSize: 10
      });
      console.log(`Connected to MongoDB server with URL: ${url}`);
    } catch (error) {
      console.error(`Cannot connect to mongodb: ${error.message}`);
    } finally {
      _dbInfo = { host, port, database };
    }
  },

  info: function() {
    return {
      ..._dbInfo,
      state: {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting"
      }[mongoose.connection.readyState]
    };
  }
};
