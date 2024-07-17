import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { poweredBy } from "hono/powered-by";
import { logger } from "hono/logger";
import dbConnect from "./db/connect";
import FavYTVideosModel from "./db/fav-youtube-model";
import { isValidObjectId } from "mongoose";
import { stream, streamText } from "hono/streaming";

const app = new Hono();

//middlewares
app.use(poweredBy());
app.use(logger());

dbConnect()
  .then(() => {
    //GET List
    app.get("/", async (c) => {
      const documents = await FavYTVideosModel.find();
      return c.json(
        documents.map((d) => d.toObject()),
        200
      );
    });

    //Creating a Document
    app.post("/", async (c) => {
      const formData = await c.req.json();
      if (!formData.thumbnailUrl) delete formData.thumbnailUrl;

      const favYtVideosObj = new FavYTVideosModel(formData);
      try {
        const document = await favYtVideosObj.save();
        return c.json(document.toObject(), 201);
      } catch (error) {
        return c.json((error as any)?.message || "Internal Server Error", 500);
      }
    });

    //View Doc by Id
    app.get("/:documentId", async (c) => {
      const id = c.req.param("documentId");
      if (!isValidObjectId(id)) {
        return c.json("Invaild ID", 400);
      }
      const document = await FavYTVideosModel.findById(id);
      if (!document) return c.json("Document not found", 404);
      return c.json(document.toObject(), 200);
    });

    app.get("/d/:documentId", async (c) => {
      const id = c.req.param("documentId");
      if (!isValidObjectId(id)) {
        return c.json("Invaild ID", 400);
      }
      const document = await FavYTVideosModel.findById(id);
      if (!document) return c.json("Document not found", 404);

      return streamText(c, async (stream) => {
        stream.onAbort(() => {
          console.log("Stream Aborted");
        });
        for (let i = 0; i < document.description.length; i++) {
          await stream.write(document.description[i]);
          await stream.sleep(100);
        }
      });
    });

    app.patch("/:documentId", async (c) => {
      const id = c.req.param("documentId");
      if (!isValidObjectId(id)) {
        return c.json("Invaild ID", 400);
      }
      const document = await FavYTVideosModel.findById(id);
      if (!document) return c.json("Document not found", 404);

      const formData = await c.req.json();
      if (!formData.thumbnailUrl) delete formData.thumbnailUrl;
      try {
        const updatedDoc = await FavYTVideosModel.findByIdAndUpdate(
          id,
          formData,
          { new: true }
        );

        return c.json(updatedDoc?.toObject(), 200);
      } catch (error) {
        return c.json((error as any)?.message || "Internal Server Error", 500);
      }
    });

    app.delete("/:documentId", async (c) => {
      const id = c.req.param("documentId");
      if (!isValidObjectId(id)) {
        return c.json("Invaild ID", 400);
      }
      try {
        const deletedDoc = await FavYTVideosModel.findByIdAndDelete(id);
        return c.json(deletedDoc?.toObject(), 200);
      } catch (error) {
        return c.json((error as any)?.message || "Internal Server Error", 500);
      }
    });
  })
  .catch((err) => {
    app.get("/*", (c) => {
      return c.text(`Failed to connect mongodb: ${err.message}`);
    });
  });

app.onError((err, c) => {
  return c.text(`App Error: ${err.message}`);
});

// app.get('/', (c) => {
//   return c.html('<h1>Hello Hono!</h1>')
// })

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
