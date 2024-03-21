# PEERAMP (FILE MANAGEMENT SERVER)

The official file management server for the PeerAmp. This server is responsible for managing, uploading, validating, converting and compressing files. It also provides a simple API for the Peeramp client to interact with.

> As [Bun](https://bun.sh/) is still under development for Windows, and we only have Windows installed on our devices, we could not test the compatibility of the project with Bun. We recommend using [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.js.org/) as the package manager for this project.

> **NOTE:** In case you are wondering, this project uses [Express.js](https://expressjs.com/) under the hood. We didn't follow the traditional Express.js project structure. Instead, we used [nextress](https://github.com/itsdrvgo/nextress), a custom Express.js project structure that we created. The project structure is similar to the Next.js project structure (File-based routing).

## Prerequisites

-   [Node.js](https://nodejs.org/en/) - The JavaScript runtime used to run the server. `(Recommended: >=20.10.0)`
-   [ffmpeg](https://ffmpeg.org/) - The command line tool used to convert and compress videos.
-   [ghostscript](https://www.ghostscript.com/) - The command line tool used to convert and compress pdfs. (Windows only)
-   [Nodemon](https://nodemon.io/) - The tool used to automatically restart the server when changes are made to the source code. `(Recommended: >=2.0.7)`
    -   If you are using `Bun`, you don't need to install `Nodemone` as `Bun` provides a built-in hot-reload flag.

## Installation

```bash
npm i
# or
yarn install
# or
pnpm i

# If you are using Bun, you can skip the following command
npm i -g nodemon

# If you are using Windows, you need to install ghostscript
# You can download ghostscript from the following link
# https://www.ghostscript.com/download/gsdnld.html
# After downloading, install ghostscript and add the path to the environment variables

# If you are using Windows, you need to install ffmpeg
# You can download ffmpeg from the following link
# https://ffmpeg.org/download.html
# After downloading, install ffmpeg and add the path to the environment variables

# If you are using Bun, run the following command to install the dependencies
bun i
```

## Configuration

The server can be configured by setting the following environment variables.

-   `PORT` - The port the server will listen on. Defaults to `3001`.
-   `UPLOADTHING_SECRET` - The secret key for the UploadThing API.
-   `UPLOADTHING_APP_ID` - The app id for the UploadThing API.

By default, we choose to use the [UploadThing](https://uploadthing.com/) API as the file storage provider. Feel free to use any other file storage provider of your choice. You can find the UploadThing API documentation [here](https://docs.uploadthing.com/).

## Usage

Once initialized, the server will listen on port 3001 by default. This can be changed by setting the `PORT` environment variable.

### Dev Mode:

```bash
npm run dev
```

If you are using Bun and you chose not to install `Nodemon`, add this script to your `package.json` file.

```json
"scripts": {
    "dev": "bun run --watch src/index.ts"
}
```

Then run the following command.

```bash
bun run dev
```

### Build / Transpile:

```bash
npm run build
```

-   This command will transpile the TypeScript files into JavaScript files and output them to the `dist` directory.

-   If you have `ts-node` installed, or if you are using Bun, you can skip this step. Transpilation is not necessary as `ts-node` and `Bun` can run TypeScript files directly.

### Start:

```bash
npm run start
```

-   This command will start the server using the transpiled JavaScript files in the `dist` directory.

-   If you want to start the server in `watch` mode, you can use the following command.

```bash
npm run start:watch
```

For Bun users, you can add the following script to your `package.json` file.

```json
"scripts": {
    "start": "bun run src/index.ts"
}
```

Then run the following command.

```bash
bun run start
```

## API

### POST `/api/pdfs/compress`

-   **Request**

    `**Content-Type: multipart/form-data**`

    ```ts
    type Input = {
        file: File;
        uploaderId: string;
    };
    ```

    -   `file` - The file to be compressed.
    -   `uploaderId` - The user id of the user who uploaded the file.

-   **Response**

    `**Response Type: JSON**`

    ```ts
    type Response = {
        message: string;
        data?: {
            files: {
                key: string;
                url: string;
                size: number;
                name: string;
            }[];
            uploaderId: string;
        };
    };
    ```

    -   `message` - The message of the response.
    -   `data` - The data of the response (optional).
        -   `files` - The files that were compressed.
            -   `key` - The key of the file.
            -   `url` - The url of the file.
            -   `size` - The size of the file.
            -   `name` - The name of the file.
        -   `uploaderId` - The id of the user who uploaded the file.

### POST `/api/pdfs/extract`

-   **Request**

    **`Content-Type: multipart/form-data`**

    ```ts
    type Input = {
        file: File;
        uploaderId: string;
    };
    ```

    -   `file` - The file to be compressed.
    -   `uploaderId` - The user id of the user who uploaded the file.

-   **Response**

    **`Response Type: JSON`**

    ```ts
    type Response = {
        message: string;
        data?: {
            text: string;
            uploaderId: string;
        };
    };
    ```

    -   `message` - The message of the response.
    -   `data` - The data of the response (optional).
        -   `text` - The text extracted from the file.
        -   `uploaderId` - The id of the user who uploaded the file.

### POST `/api/videos/compress`

-   **Request**

    **`Content-Type: multipart/form-data`**

    ```ts
    type Input = {
        video: File;
        uploaderId: string;
    };
    ```

    -   `video` - The video to be compressed.
    -   `uploaderId` - The user id of the user who uploaded the file.

-   **Response**

    **`Response Type: JSON`**

    ```ts
    type Response = {
        message: string;
        data?: {
            files: {
                key: string;
                url: string;
                size: number;
                name: string;
            }[];
            uploaderId: string;
        };
    };
    ```

    -   `message` - The message of the response.
    -   `data` - The data of the response (optional).
        -   `files` - The files that were compressed.
            -   `key` - The key of the file.
            -   `url` - The url of the file.
            -   `size` - The size of the file.
            -   `name` - The name of the file.
        -   `uploaderId` - The id of the user who uploaded the file.

### POST `/api/images/compress`

-   **Request**

    **`Content-Type: multipart/form-data`**

    ```ts
    type Input = {
        images: File[];
        uploaderId: string;
    };
    ```

    -   `images` - The images to be compressed.
    -   `uploaderId` - The user id of the user who uploaded the file.

-   **Response**

    **`Response Type: JSON`**

    ```ts
    type Response = {
        message: string;
        data?: {
            files: {
                key: string;
                url: string;
                size: number;
                name: string;
            }[];
            uploaderId: string;
        };
    };
    ```

    -   `message` - The message of the response.
    -   `data` - The data of the response (optional).
        -   `files` - The files that were compressed.
            -   `key` - The key of the file.
            -   `url` - The url of the file.
            -   `size` - The size of the file.
            -   `name` - The name of the file.
        -   `uploaderId` - The id of the user who uploaded the file.

## SOCKET

The server also provides a socket for the PeerAmp client to interact with. The socket is used to send and receive messages between the client and the server. The socket is initialized on the `/` route (i.e. `http://localhost:3001/`). We will be changing the route to `/api/socket` in the future.

-   **Event Types**

    -   `image_upload_progress` - The message type for the image upload progress event.
    -   `pdf_upload_progress` - The message type for the pdf upload progress event.
    -   `pdf_extract_progress` - The message type for the pdf extract progress event.
    -   `video_upload_progress` - The message type for the video upload progress event.

Even though the socket emits these messages, we do not recommend using them. Instead use the Enums provided in [here](./src/config/enums.ts). Directly copy-paste the enums into your project, and emit the messages using the enums.

For example, to receive the `image_upload_progress` message on the client, you would do the following:

```ts
import { SOCKET_EVENT } from "path/to/enums";

socket.on(SOCKET_EVENT.IMAGE_UPLOAD_PROGRESS, (data) => {
    // Do something with the data
});
```

We will be adding more message types in the future.

## Conclusion

That's it! You have successfully set up our file management server. We planned the main project a long time ago and even started working on it. Unfortunately, we could not complete the project due to some personal reasons.

The main repository is still private, and we are not planning to make it public anytime soon. Instead, we decided to open-source the file management server as it is a standalone project and can be used by anyone. We hope you find this project useful. Feel free to contribute to the project by creating a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Feedback

Feel free to send me feedback on [X](https://x.com/itsdrvgo) or file an issue. Feature requests are always welcome. If you wish to contribute, please take a quick look at the [CONTRIBUTING.md](CONTRIBUTING.md) file.

Join our Discord server [here](https://dsc.gg/drvgo)!

## Connect with me

[![Instagram](https://img.shields.io/badge/Instagram-%23E4405F.svg?logo=Instagram&logoColor=white)](https://instagram.com/itsdrvgo)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-%230077B5.svg?logo=linkedin&logoColor=white)](https://linkedin.com/in/itsdrvgo)
[![Twitch](https://img.shields.io/badge/Twitch-%239146FF.svg?logo=Twitch&logoColor=white)](https://twitch.tv/itsdrvgo)
[![X](https://img.shields.io/badge/X-%23000000.svg?logo=X&logoColor=white)](https://x.com/itsdrvgo)
[![YouTube](https://img.shields.io/badge/YouTube-%23FF0000.svg?logo=YouTube&logoColor=white)](https://youtube.com/@itsdrvgodev)
