import { UTApi } from "uploadthing/server";
export const utapi: UTApi = new UTApi({
    apiKey: process.env.UPLOADTHING_SECRET,

});
