import mongoose from "mongoose";

const sensorDataSchema = new mongoose.Schema(
  {
    sensorId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["temperature", "humidity", "soil_moisture", "light_intensity"],
    },
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const SensorData = mongoose.model("SensorData", sensorDataSchema);

export default SensorData;
