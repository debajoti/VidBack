import { Schema, model } from "mongoose";

export interface IFAvYTVideoSchema {
  title: string;
  description: string;
  thumbnailUrl?: string;
  watched: boolean;
  youtubeName: string;
}

const FavYTVideoSchema = new Schema<IFAvYTVideoSchema>({
title: { 
    type: String, 
    required: true 
},
description: { 
    type: String, 
    required: true 
},
thumbnailUrl: { 
    type: String, 
    default: "",
    required: false
},
watched: { 
    type: Boolean, 
    default: false,
    required: true
},
youtubeName: { 
    type: String, 
    required: true 
},
});

const FavYTVideosModel = model('fav-youtube-videos', FavYTVideoSchema);

export default FavYTVideosModel;
