# PEERAMP (FILE MANAGEMENT SERVER)

The official file management server for the Peeramp. This server is responsible for managing, uploading, validating, converting and compressing files. It also provides a simple API for the Peeramp client to interact with.

## Prerequisites

-   [Node.js](https://nodejs.org/en/) - The JavaScript runtime used to run the server. `(Recommended version: >=20.10.0)`
-   [pnpm](https://pnpm.js.org/) - The package manager used to manage the server's dependencies.
-   [ffmpeg](https://ffmpeg.org/) - The command line tool used to convert and compress videos.
-   [ghostscript](https://www.ghostscript.com/) - The command line tool used to convert and compress pdfs. (Windows only)
-   [Nodemon](https://nodemon.io/) - The tool used to automatically restart the server when changes are made to the source code. `(Recommended version: >=2.0.7)`

## Installation

```bash
pnpm i
```

## Configuration

The server can be configured by setting the following environment variables.

-   `PORT` - The port the server will listen on. Defaults to `3001`.
-   `UPLOADTHING_SECRET` - The secret key for the UploadThing API.
-   `UPLOADTHING_APP_ID` - The app id for the UploadThing API.

## Usage

Once initialized, the server will listen on port 3001 by default. This can be changed by setting the `PORT` environment variable.

-   Initialize Dev Mode

    ```bash
    pnpm dev
    ```

-   Initialize Production Mode

    -   Build the project

        ```bash
        pnpm build
        ```

    -   Start the server

        ```bash
        pnpm start
        ```

-   Lint the project

    ```bash
    pnpm lint
    ```

## API

### POST /api/pdfs/compress

-   **Request**

    `**Content-Type: multipart/form-data**`

    ```json
    "file": "File" // - The file to be compressed
    "uploaderId": "string" // - The user id of the user who uploaded the file
    ```

-   **Response**

    ```json
    {
        "message": "string", // - The message of the response
        "data": {
            "files": {
                "key": "string", // - The key of the file
                "url": "string", // - The url of the file
                "size": "number", // - The size of the file
                "name": "string", // - The name of the file
            }[], // - The file that was compressed
            "uploaderId": "string", // - The id of the user who uploaded the file
        } | "undefined" // - The data of the response
    }
    ```

### POST /api/pdfs/extract

-   **Request**

    **`Content-Type: multipart/form-data`**

    ```json
    "file": "File", // - The file to be extracted
    "uploaderId": "string" // - The user id of the user who uploaded the file
    ```

-   **Response**

    ```json
    {
        "message": "string", // - The message of the response
        "data": {
            "text": "string", // - The text extracted from the file
            "uploaderId": "string", // - The id of the user who uploaded the file
        } | "undefined" // - The data of the response
    }
    ```

### POST /api/videos/compress

-   **Request**

    **`Content-Type: multipart/form-data`**

    ```json
    "video": "File", // - The video to be compressed
    "uploaderId": "string" // - The user id of the user who uploaded the file
    ```

-   **Response**

    ```json
    {
        "message": "string", // - The message of the response
        "data": {
            "files": {
                "key": "string", // - The key of the file
                "url": "string", // - The url of the file
                "size": "number", // - The size of the file
                "name": "string", // - The name of the file
            }[], // - The video that was compressed
            "uploaderId": "string", // - The id of the user who uploaded the file
        } | "undefined" // - The data of the response
    }
    ```

### POST /api/images/compress

-   **Request**

    **`Content-Type: multipart/form-data`**

    ```json
    "images": "File[]", // - The images to be compressed
    "uploaderId": "string" // - The user id of the user who uploaded the file
    ```

-   **Response**

    ```json
    {
        "message": "string", // - The message of the response
        "data": {
            "files": {
                "key": "string", // - The key of the file
                "url": "string", // - The url of the file
                "size": "number", // - The size of the file
                "name": "string", // - The name of the file
            }[], // - The images that were compressed
            "uploaderId": "string", // - The id of the user who uploaded the file
        } | "undefined" // - The data of the response
    }
    ```

### SOCKET

The server also provides a socket for the Peeramp client to interact with. The socket is used to send and receive messages between the client and the server. The socket is initialized on the `/` route (i.e. `http://localhost:3001/`). We will be changing the route to `/api/socket` in the future.

-   **Message Types**

    -   `image_upload_progress` - The message type for the image upload progress event.
    -   `pdf_upload_progress` - The message type for the pdf upload progress event.
    -   `pdf_extract_progress` - The message type for the pdf extract progress event.
    -   `video_upload_progress` - The message type for the video upload progress event.

Even though the socket emits theses messages, we do not recommend using them. Instead use the Enums provided in [here](./src/config/enums.ts). Directly copy-paste the enums into your project, and emit the messages using the enums.

For example, to receive the `image_upload_progress` message on the client, you would do the following:

```ts
socket.on(SOCKET_EVENT.IMAGE_UPLOAD_PROGRESS, (data) => {
    // Do something with the data
});
```

We will be adding more message types in the future.

### Conclusion

For more information, please refer to [PeerAmp](https://github.com/itsdrvgo/peeramp/).
