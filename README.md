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

### POST /api/resume/process

-   **Request**

    `**Content-Type: multipart/form-data**`

    ```json
    "file": File // - The file to be processed
    "userId": string // - The user id of the user who uploaded the file
    ```

-   **Response**

    ```json
    {
        "message": string // - The message of the response
    }
    ```

### Conclusion

For more information, please refer to [PeerAmp](https://peeramp.vercel.app/).
