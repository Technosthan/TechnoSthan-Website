const mongoose = require("mongoose");

const whatsappContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    number: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const socialSchema = new mongoose.Schema(
  {
    socials: {
      type: new mongoose.Schema(
        {
          whatsapp_contacts: {
            type: [whatsappContactSchema],
            default: []
          }
        },
        { _id: false }
      ),
      required: true,
      default: {
        whatsapp_contacts: [] // yahan saare contacts store honge
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Social", socialSchema);