import { app } from '@azure/functions';
import {
  parse as parseMultipartData,
} from "../lib/multipart.js";

app.http('http-example', {
  methods: ['POST'],
  handler: async (request, context) => {
      const contentType = request.headers.get('content-type')
  const isMultipart = contentType != null && contentType.startsWith('multipart/form-data')

  if (!contentType || !contentType.startsWith("multipart/form-data")) {
      return {
        status: 400,
        body: JSON.stringify({
          status: 400,
          error: 'Invalid content type',
        }),
      };
  }
  const boundary = contentType.match(/boundary=([^;]*)(;|$)/i)?.[1];
  if (!boundary) {
      return {
        status: 400,
        body: JSON.stringify({
          status: 400,
          error: 'Boundary not found in content type',
        }),
      };
  }

  const formData = await request.formData();
  const formDataFile = formData.get("file");

  if(typeof formDataFile === "string") {
    return {
      status: 400,
      body: JSON.stringify({
        status: 400,
        error: 'File is not a Blob',
      }),
    };
  }


  //console.log(await formDataFile.text())
  console.log(formDataFile.bytes.length)

  const bodyText = await request.text();
  //console.log(bodyText)
  const h3FormData = parseMultipartData(Buffer.from(bodyText), boundary);
  const file = h3FormData.find((partData) => partData.name === "file");

    if (!file) {
      return {
        status: 400,
        body: JSON.stringify({
          status: 400,
          error: 'Missing file in form data',
        }),
      };
    }

    return {
      status: 200,
      body: JSON.stringify({
        fileSize: file.data.byteLength
      })
    }
  },
});
