export const sanitizeMessage = (message: string) => {
  return message.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
};
