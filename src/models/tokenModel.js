const mongoose = require("mongoose");
const { Role } = require("../helpers/Enum");
const { Schema } = mongoose;

const TokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: false,
      refPath: 'userType', //TODO: Reference collection based on userType
    },
    userType: {
      type: String,
      enum: Role,
    },
    token: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Token", TokenSchema);
