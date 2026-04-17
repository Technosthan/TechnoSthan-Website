import IoTData from "./iotData.model.js";

// insert data (simulate sensor)
export const addData = async (data) => {
  return await IoTData.create(data);
};

// get all data (with filters)
export const getData = async (query) => {
  const { device_id, from, to } = query;

  let filter = {};

  if (device_id) filter.device_id = device_id;

  if (from && to) {
    filter.timestamp = {
      $gte: new Date(from),
      $lte: new Date(to),
    };
  }

  return await IoTData.find(filter).sort({ timestamp: -1 });
};

// latest reading per device
export const getLatest = async () => {
  return await IoTData.aggregate([
    { $sort: { timestamp: -1 } },
    {
      $group: {
        _id: "$device_id",
        latest: { $first: "$$ROOT" },
      },
    },
  ]);
};

// update data
export const updateData = async (id, data) => {
  return await IoTData.findByIdAndUpdate(id, data, { new: true });
};

// remove data
export const removeData = async (id) => {
  return await IoTData.findByIdAndDelete(id);
};
