import mongoose from "mongoose";

const iotSchema = new mongoose.Schema({
  device_id: {
    type: String,
    required: true,
    index: true
  },
  soil_moisture: {
    type: Number,
    required: true
  },
  temperature: {
    type: Number,
    required: true
  },
  humidity: {
    type: Number,
    required: true
  },
  ph: {
    type: Number
  },
  timestamp: {
    type: Date,
    required: true,
    index: true
  }
}, { timestamps: true });

const IoTData = mongoose.model("IoTData", iotSchema);

export default IoTData;