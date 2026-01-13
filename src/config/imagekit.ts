import ImageKit from "imagekit";

export const imageKit = new ImageKit({
    publicKey: String(process.env.IMAGEKIT_KEY),
    privateKey: String(process.env.IMAGEKIT_PRIVATE),
    urlEndpoint: String(process.env.IMAGEKIT_ENDPOINT),
});
