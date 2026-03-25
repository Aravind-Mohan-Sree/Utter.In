export const filePrefixes = {
  TEMP_USER_AVATAR: 'temp/users/avatars/',
  TEMP_TUTOR_AVATAR: 'temp/tutors/avatars/',
  TEMP_TUTOR_VIDEO: 'temp/tutors/videos/',
  TEMP_TUTOR_CERTIFICATE: 'temp/tutors/certificates/',
  TEMP_REJECTED_TUTOR_AVATAR: 'temp/rejected-tutors/avatars/',
  TEMP_REJECTED_TUTOR_VIDEO: 'temp/rejected-tutors/videos/',
  TEMP_REJECTED_TUTOR_CERTIFICATE: 'temp/rejected-tutors/certificates/',
  USER_AVATAR: 'users/avatars/',
  TUTOR_AVATAR: 'tutors/avatars/',
  TUTOR_VIDEO: 'tutors/videos/',
  TUTOR_CERTIFICATE: 'tutors/certificates/',
  CHAT_ATTACHMENT: 'chats/attachments/',
} as const;

export const contentTypes = {
  IMAGE_JPEG: 'image/jpeg',
  VIDEO_MP4: 'video/mp4',
  APPLICATION_PDF: 'application/pdf',
} as const;
