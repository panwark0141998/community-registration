/**
 * Compresses an image from a base64 string using HTML5 Canvas.
 * @param base64 The source base64 string of the image.
 * @param maxWidth The maximum width for the compressed image.
 * @param maxHeight The maximum height for the compressed image.
 * @param quality The compression quality (0 to 1).
 * @returns A promise that resolves to the compressed base64 string.
 */
export const compressImage = (
    base64: string,
    maxWidth: number = 800,
    maxHeight: number = 800,
    quality: number = 0.7
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64;
        img.onload = () => {
            let width = img.width;
            let height = img.height;

            // Calculate new dimensions
            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                reject(new Error("Could not get canvas context"));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            // Compress to JPEG for better size reduction
            const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
            resolve(compressedBase64);
        };
        img.onerror = (err) => reject(err);
    });
};
