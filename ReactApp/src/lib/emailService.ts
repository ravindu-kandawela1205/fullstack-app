import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

interface EmailParams {
  templateId: string;
  data: Record<string, any>;
}

export const sendEmail = async ({ templateId, data }: EmailParams) => {
  try {
    const response = await emailjs.send(
      SERVICE_ID,
      templateId,
      data,
      PUBLIC_KEY
    );
    return { success: true, response };
  } catch (error) {
    console.error('Email send failed:', error);
    return { success: false, error };
  }
};
