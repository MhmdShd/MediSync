export const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;
export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

export type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number];

export function isAllowedFileType(type: string): type is AllowedFileType {
  return (ALLOWED_FILE_TYPES as readonly string[]).includes(type);
}

export function validateFileUpload(
  fileType: string,
  fileSize: number
): { valid: true } | { valid: false; error: string } {
  if (!isAllowedFileType(fileType)) {
    return { valid: false, error: "File type not allowed. Use PDF, JPG, or PNG." };
  }
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: "File size exceeds 20MB limit." };
  }
  return { valid: true };
}
