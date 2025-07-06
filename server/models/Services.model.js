import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    
    },
    status: {
      type: String,
      required: true,
      enum: [
        "Operational",
        "Degraded Performance",
        "Partial Outage",
        "Major Outage",
      ],
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", ServiceSchema);
export default Service;
