import mongoose from "mongoose";
import config from "config";

export const initDb = async () => {
    await mongoose.connect(config.get("database.url"));
};
