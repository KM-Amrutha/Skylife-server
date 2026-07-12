import mongoose, { Schema } from "mongoose";

const airportFacilitySchema: Schema = new Schema(
  {
    destinationId: {
      type: String,
      required: true,
      ref: "Destination"
    },
    facilityName: {
      type: String,
      required: true,
      trim: true
    },
    facilityType: {
      type: String,
      required: true,
      enum: ["lounge", "restaurant", "shopping", "parking", "hotel", "transport", "other"]
    },
    description: {
      type: String,
      trim: true
    },
    locationDetails: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

airportFacilitySchema.index({ destinationId: 1 });
airportFacilitySchema.index({ facilityType: 1 });

const AirportFacilityModel = mongoose.model(
  "AirportFacility",
  airportFacilitySchema
);
export default AirportFacilityModel;
