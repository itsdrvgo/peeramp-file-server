# PEERAMP (FILE MANAGEMENT SERVER)

The official file management server for the Peeramp. This server is responsible for managing, uploading, validating, converting and compressing files. It also provides a simple API for the Peeramp client to interact with.

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
                "data": {
                    "key": "string", // - The key of the file
                    "url": "string", // - The url of the file
                    "size": "number", // - The size of the file
                    "name": "string", // - The name of the file
                },
                "error": {
                    "code": "string" // - The error code
                    "message": "string" // - The error message
                    "data": "any" // - The error data
                } | null
            }[], // - The files that were compressed
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
                "data": {
                    "key": "string", // - The key of the file
                    "url": "string", // - The url of the file
                    "size": "number", // - The size of the file
                    "name": "string", // - The name of the file
                },
                "error": {
                    "code": "string" // - The error code
                    "message": "string" // - The error message
                    "data": "any" // - The error data
                } | null
            }[], // - The videos that were compressed
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
                "data": {
                    "key": "string", // - The key of the file
                    "url": "string", // - The url of the file
                    "size": "number", // - The size of the file
                    "name": "string", // - The name of the file
                },
                "error": {
                    "code": "string" // - The error code
                    "message": "string" // - The error message
                    "data": "any" // - The error data
                } | null
            }[], // - The images that were compressed
            "uploaderId": "string", // - The id of the user who uploaded the file
        } | "undefined" // - The data of the response
    }
    ```

### Conclusion

For more information, please refer to [PeerAmp](https://peeramp.vercel.app/).
