import mongoose from "mongoose";
import mongoose_delete from "mongoose-delete";
import mongoose_timestamp from "mongoose-timestamp";
import toJson from "../util/db_to_json";

mongoose.plugin(toJson);
mongoose.plugin(mongoose_timestamp, {
  createdAt: "created_at",
  updatedAt: "updated_at"
});
mongoose.plugin(mongoose_delete, { overrideMethods: true });
